terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
  backend "s3" {
    bucket  = "bedrock-project-tf-state"
    key     = "bedrock-project-tf-state"
    region  = "eu-central-1"
    profile = "personal-vpn"
  }
}

provider "aws" {
  region  = "ap-southeast-2"
  profile = "personal-vpn"
}