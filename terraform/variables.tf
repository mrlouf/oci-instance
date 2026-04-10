variable "tenancy_ocid" {
  description = "OCID de ta tenancy OCI"
  type        = string
}

variable "user_ocid" {
  description = "OCID de ton user OCI"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint de ta clé API OCI"
  type        = string
}

variable "private_key_path" {
  description = "Chemin vers ta clé privée API OCI (~/.oci/oci_api_key.pem)"
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "region" {
  description = "Région OCI (ex: eu-frankfurt-1, us-ashburn-1)"
  type        = string
  default     = "eu-frankfurt-1"
}

variable "compartment_ocid" {
  description = "OCID du compartment (utilise le root compartment = tenancy_ocid si pas sûr)"
  type        = string
}

variable "ssh_public_key_path" {
  description = "Chemin vers ta clé SSH publique pour accéder à la VM"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "instance_display_name" {
  description = "Nom affiché de l'instance dans la console OCI"
  type        = string
  default     = "portfolio"
}

variable "vcn_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}
