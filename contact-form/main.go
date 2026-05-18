package main

import (
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/mail"
	"net/smtp"
	"os"
	"strings"
	"time"
)

type config struct {
	ListenAddr    string
	SiteBaseURL   string
	SmtpHost      string
	SmtpPort      string
	SmtpUser      string
	SmtpPass      string
	MailTo        string
	MailFrom      string
	SubjectPrefix string
}

func main() {
	cfg, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/contact", func(w http.ResponseWriter, r *http.Request) {
		handleContact(w, r, cfg)
	})

	srv := &http.Server{
		Addr:              cfg.ListenAddr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       30 * time.Second,
	}

	log.Printf("contact form listening on %s", cfg.ListenAddr)
	log.Fatal(srv.ListenAndServe())
}

func loadConfig() (config, error) {
	cfg := config{
		ListenAddr:    getenvDefault("CONTACT_LISTEN_ADDR", ":8085"),
		SiteBaseURL:   getenvDefault("SITE_BASE_URL", "https://mrlouf.com"),
		SmtpHost:      getenvDefault("SMTP_HOST", "smtp.gmail.com"),
		SmtpPort:      getenvDefault("SMTP_PORT", "587"),
		SmtpUser:      os.Getenv("SMTP_USER"),
		SmtpPass:      os.Getenv("SMTP_PASS"),
		MailTo:        os.Getenv("MAIL_TO"),
		MailFrom:      os.Getenv("MAIL_FROM"),
		SubjectPrefix: getenvDefault("SUBJECT_PREFIX", ""),
	}

	if cfg.SmtpUser == "" || cfg.SmtpPass == "" || cfg.MailTo == "" {
		return cfg, errors.New("missing SMTP_USER, SMTP_PASS, or MAIL_TO")
	}
	if cfg.MailFrom == "" {
		cfg.MailFrom = cfg.SmtpUser
	}

	return cfg, nil
}

func handleContact(w http.ResponseWriter, r *http.Request, cfg config) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	if err := r.ParseForm(); err != nil {
		log.Printf("parse form: %v", err)
		redirectBack(w, r, cfg, false)
		return
	}

	if strings.TrimSpace(r.FormValue("company")) != "" {
		redirectBack(w, r, cfg, true)
		return
	}

	name := strings.TrimSpace(r.FormValue("name"))
	email := strings.TrimSpace(r.FormValue("email"))
	message := strings.TrimSpace(r.FormValue("message"))

	if name == "" || email == "" || message == "" {
		redirectBack(w, r, cfg, false)
		return
	}

	if _, err := mail.ParseAddress(email); err != nil {
		redirectBack(w, r, cfg, false)
		return
	}

	if len(message) > 4000 {
		redirectBack(w, r, cfg, false)
		return
	}

	clientIP := extractClientIP(r)
	if err := sendMail(cfg, name, email, message, clientIP); err != nil {
		log.Printf("send mail: %v", err)
		redirectBack(w, r, cfg, false)
		return
	}

	redirectBack(w, r, cfg, true)
}

func sendMail(cfg config, name, email, message, clientIP string) error {
	subject := fmt.Sprintf("%sNew contact form message", cfg.SubjectPrefix)

	headers := []string{
		fmt.Sprintf("From: %s", sanitizeHeaderValue(cfg.MailFrom)),
		fmt.Sprintf("To: %s", sanitizeHeaderValue(cfg.MailTo)),
		fmt.Sprintf("Reply-To: %s", sanitizeHeaderValue(email)),
		fmt.Sprintf("Subject: %s", sanitizeHeaderValue(subject)),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
	}

	body := fmt.Sprintf(
		"Name: %s\nEmail: %s\nIP: %s\n\nMessage:\n%s\n",
		name,
		email,
		clientIP,
		message,
	)

	msg := strings.Join(append(headers, body), "\r\n")

	addr := net.JoinHostPort(cfg.SmtpHost, cfg.SmtpPort)
	auth := smtp.PlainAuth("", cfg.SmtpUser, cfg.SmtpPass, cfg.SmtpHost)

	return smtp.SendMail(addr, auth, cfg.MailFrom, []string{cfg.MailTo}, []byte(msg))
}

func redirectBack(w http.ResponseWriter, r *http.Request, cfg config, success bool) {
	statusParam := "error=1"
	if success {
		statusParam = "sent=1"
	}

	base := strings.TrimRight(cfg.SiteBaseURL, "/")
	location := fmt.Sprintf("%s/?%s#contact", base, statusParam)

	http.Redirect(w, r, location, http.StatusSeeOther)
}

func sanitizeHeaderValue(value string) string {
	value = strings.ReplaceAll(value, "\r", "")
	value = strings.ReplaceAll(value, "\n", "")
	return value
}

func extractClientIP(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		parts := strings.Split(forwarded, ",")
		if len(parts) > 0 {
			return strings.TrimSpace(parts[0])
		}
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}

	return r.RemoteAddr
}

func getenvDefault(key, value string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return value
}
