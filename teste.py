from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2
from diagrams.onprem.client import Users
from diagrams.onprem.database import PostgreSQL, MongoDB, Elasticsearch
from diagrams.onprem.network import Nginx
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.container import Docker
from diagrams.programming.framework import Fastapi
from diagrams.saas.alerting import Slack

with Diagram("Arquitetura do Projeto de Previsão de Partidas", show=False, direction="LR"):
    
    user = Users("Usuário Final")

    with Cluster("Backend API"):
        api = Fastapi("API Backend")
        nginx = Nginx("Nginx")
        cache = Redis("Cache")
        api >> cache

    with Cluster("Serviço de Scraping"):
        scraper = Docker("Scraper Service")
        mongo = MongoDB("MongoDB\n(matches_raw_data,\nplayers_raw_data)")
        scraper >> mongo

    with Cluster("Serviço de Processamento de Estatísticas"):
        stats_engine = Docker("Statistics Engine")
        postgres = PostgreSQL("PostgreSQL\n(processed_statistics,\nmatch_predictions)")
        stats_engine >> postgres

    with Cluster("Logs e Monitoramento"):
        elastic = Elasticsearch("Elasticsearch\n(scraper_logs,\nstatistics_engine_logs)")
        scraper >> elastic
        stats_engine >> elastic

    user >> nginx >> api
    api >> postgres
    api >> mongo
    api >> elastic
    stats_engine >> mongo
    scraper >> Slack("Alerta de Erros")


