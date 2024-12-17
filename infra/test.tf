module "vpc_project_fufel" {
  source = "terraform-aws-modules/vpc/aws"

  name = "project_fufel"
  cidr = "10.0.0.0/16"

  azs             = ["apse2-az1", "apse2-az2", "apse2-az3"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]

  enable_nat_gateway = false
  enable_vpn_gateway = false
}

module "aurora_project_fufel" {
  source = "terraform-aws-modules/rds-aurora/aws"

  name                 = "aurora-project-fufel"
  engine               = "aurora-postgresql"
  engine_version       = "16.4"
  enable_http_endpoint = true
  engine_mode          = "provisioned"
  master_username      = "fufel"
  database_name        = "project_fufel"
  skip_final_snapshot  = true

  instances = {
    one = { instance_class = "db.serverless" }
  }


  serverlessv2_scaling_configuration = {
    max_capacity             = 1
    min_capacity             = 0
    seconds_until_auto_pause = 300
  }

  vpc_id               = module.vpc_project_fufel.vpc_id
  db_subnet_group_name = "aurora-project-fufel"

  storage_encrypted = true
  apply_immediately = true

  depends_on = [
    aws_db_subnet_group.aurora_project_fufel
  ]
}

resource "aws_db_subnet_group" "aurora_project_fufel" {
  name       = "aurora-project-fufel"
  subnet_ids = module.vpc_project_fufel.private_subnets
}