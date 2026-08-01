locals {
  services = [
    "tamwil-frontend-proxy",
    "tamwil-backend-emi",
     "tamwil-backend-sip",
   "tamwil-backend-loan"
  ]
}

resource "aws_ecr_repository" "microservices" {

    for_each = toset(local.services)

    name = each.value
    image_tag_mutability = "MUTABLE"
    image_scanning_configuration {
        scan_on_push = true
    }
    tags = {
        Environment = "Production"
        Project     = "Finance Homepage"
    }
  
}