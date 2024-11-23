output "KNOWLEDGEBASE_ID" {
  value = aws_bedrockagent_knowledge_base.this.id
}

output "DATASOURCE_ID" {
  value = aws_bedrockagent_data_source.this.data_source_id
}