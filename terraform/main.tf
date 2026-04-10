# ─── DATA SOURCES ────────────────────────────────────────────────────────────

# Récupère l'image Ubuntu 24.04 la plus récente disponible dans la région
data "oci_core_images" "ubuntu_24_04" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.E2.1.Micro"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# ─── RÉSEAU ──────────────────────────────────────────────────────────────────

resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_ocid
  cidr_block     = var.vcn_cidr
  display_name   = "${var.instance_display_name}-vcn"
  dns_label      = "portfolio"
}

resource "oci_core_internet_gateway" "main" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.instance_display_name}-igw"
  enabled        = true
}

resource "oci_core_route_table" "main" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.instance_display_name}-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.main.id
  }
}

resource "oci_core_security_list" "main" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.instance_display_name}-sl"

  # Trafic sortant : tout autoriser
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  # SSH (port 22)
  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP (port 80) — nécessaire pour le challenge Let's Encrypt
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS (port 443)
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # ICMP (ping) — pratique pour déboguer
  ingress_security_rules {
    protocol = "1" # ICMP
    source   = "0.0.0.0/0"
    icmp_options {
      type = 3
      code = 4
    }
  }
}

resource "oci_core_subnet" "main" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.main.id
  cidr_block        = var.subnet_cidr
  display_name      = "${var.instance_display_name}-subnet"
  dns_label         = "main"
  route_table_id    = oci_core_route_table.main.id
  security_list_ids = [oci_core_security_list.main.id]

  # IP publique assignée automatiquement
  prohibit_public_ip_on_vnic = false
}

# ─── INSTANCE ────────────────────────────────────────────────────────────────

resource "oci_core_instance" "portfolio" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = var.instance_display_name
  shape               = "VM.Standard.E2.1.Micro"

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_24_04.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.main.id
    assign_public_ip = true
    display_name     = "${var.instance_display_name}-vnic"
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    # Cloud-init minimal : active iptables pour HTTP/HTTPS dès le boot
    # (OCI bloque aussi au niveau OS avec iptables par défaut)
    user_data = base64encode(<<-EOT
      #!/bin/bash
      iptables -I INPUT -p tcp --dport 80 -j ACCEPT
      iptables -I INPUT -p tcp --dport 443 -j ACCEPT
      iptables-save > /etc/iptables/rules.v4
    EOT
    )
  }

  # Empêche la destruction accidentelle de l'instance
  lifecycle {
    prevent_destroy = true
  }
}

# ─── AVAILABILITY DOMAINS ────────────────────────────────────────────────────

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}
