output "instance_public_ip" {
  description = "IP publique de l'instance — à pointer dans ton DNS"
  value       = oci_core_instance.portfolio.public_ip
}

output "ssh_command" {
  description = "Commande SSH prête à l'emploi"
  value       = "ssh ubuntu@${oci_core_instance.portfolio.public_ip}"
}

output "instance_ocid" {
  description = "OCID de l'instance (utile pour déboguer dans la console OCI)"
  value       = oci_core_instance.portfolio.id
}
