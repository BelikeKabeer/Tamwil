module "eks" {
    source="terraform-aws-modules/eks/aws"
    version = "20.0.0"

    cluster_name    = var.cluster_name
    cluster_version = "1.31"


  # Enable both Public & Private Access to the Kubernetes API Server
  cluster_endpoint_public_access       = true
  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]
  

    vpc_id     = module.VPC.vpc_id
    subnet_ids    = module.VPC.private_subnets


    eks_managed_node_groups = {
        main={
            name = "tamwil-eks-node-group"

            desired_size = 2
            max_size     = 3
            min_size = 1


            instance_types = ["t3.micro"]
            ami_type = "AL2023_x86_64_STANDARD"

            capacity_type = "ON_DEMAND"
         
        }


    }
    tags = {
        Environment = "Production"
        Project     = "Finance Homepage"
    }

  
}