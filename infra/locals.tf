locals {
  account_id = data.aws_caller_identity.this.account_id
  region     = data.aws_region.current.name
}