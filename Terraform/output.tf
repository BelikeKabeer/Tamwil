output "cluster_name" {
    description = "The name of the EKS cluster"
    value = module.eks.cluster_name
  
}

output "cluster_endpoint" {
    description = "The endpoint of the EKS cluster"
    value = module.eks.cluster_endpoint
  
}

output "region" {
    description = "The AWS region where the resources are deployed"
    value = var.aws_region
  
}

output "ecr_respository"{
 description = "Url of created Repos"
 value ={for k, v in aws_ecr_repository.microservices : k => v.repository_url}
}