import matplotlib
matplotlib.use('Agg')  # Definir o backend para um que não usa GUI
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from pymongo import MongoClient
from flask import Flask, request, send_file, jsonify
import io

app = Flask(__name__)

# Conectar ao MongoDB
client = MongoClient("mongodb+srv://scoretipsadmin:mq87igW7MQJX7tTp@scoretips.ogtez.mongodb.net/?retryWrites=true&w=majority&appName=ScoreTips")
database = client['Statistics']

@app.route('/list_countries', methods=['GET'])
def list_countries():
    collections = database.list_collection_names()
    countries = set([collection.split('_')[0] for collection in collections])
    return jsonify(list(countries))

@app.route('/list_championships', methods=['GET'])
def list_championships():
    country = request.args.get('country')
    collections = database.list_collection_names()

    # Filtrar campeonatos que começam com o nome do país
    championships = [
        collection.split('_', 1)[1] for collection in collections if collection.startswith(f"{country}_")
    ]

    return jsonify(collections)

@app.route('/get_players', methods=['GET'])
def get_players():
    team_name = request.args.get('team')
    collection_name = request.args.get('collection')

    # Buscar os dados do time
    collection = database[collection_name]
    team_data = collection.find_one({"teamName": team_name})

    if not team_data:
        return jsonify({"error": "Time não encontrado"}), 404

    # Extrair os jogadores da coleção playerStatistics
    players = list(team_data.get('playerStatistics', {}).keys())

    return jsonify({"players": players})

# Função para listar times de um campeonato (coleção específica)
@app.route('/list_teams', methods=['GET'])
def list_teams():
    collection_name = request.args.get('collection')
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400

    collection_name = collection_name.replace(" ", "_")
    collection = database[collection_name]
    teams = collection.find({}, {"teamName": 1, "_id": 0})

    team_list = [team["teamName"] for team in teams]
    return jsonify(team_list)

@app.route('/generate_pdf_player', methods=['GET'])
def generate_pdf_player():
    team_name = request.args.get('team')
    player_name = request.args.get('player')
    collection_name = request.args.get('collection')

    # Buscar os dados do time e do jogador no MongoDB
    collection = database[collection_name]
    team_data = collection.find_one({"teamName": team_name})

    if not team_data:
        return "Dados do time não encontrados", 404

    player_data = team_data.get('playerStatistics', {}).get(player_name, {})

    if not player_data:
        return "Dados do jogador não encontrados", 404

    # Gerar o PDF do jogador
    pdf_buffer = io.BytesIO()
    with PdfPages(pdf_buffer) as pdf:
        fig = create_player_chart(player_name, player_data)
        pdf.savefig(fig)
        plt.close(fig)

    pdf_buffer.seek(0)
    return send_file(pdf_buffer, as_attachment=True, download_name=f'{player_name}_stats.pdf', mimetype='application/pdf')

def create_player_chart(player_name, player_data):
    categories = ["goals", "shots", "shotsOnTarget", "tackles", "yellowCards", "redCards", "assists"]
    x = range(1, 11)  # Supondo que temos valores de 1 a 10 para as categorias

    fig, axes = plt.subplots(2, 3, figsize=(15, 10))  # Configura um grid de 2x3

    for i, category in enumerate(categories):
        ax = axes[i // 3, i % 3]

        # Extrair os valores da categoria e garantir que sejam convertidos de string para float
        values = []
        category_data = player_data.get(category, {})

        # Iterar sobre as chaves de 1 a 10 e garantir que o valor é um número
        for key in map(str, x):
            value = category_data.get(key, "0.00%").replace("%", "").strip()  # Remover o símbolo de porcentagem
            try:
                values.append(float(value))  # Converter para float
            except ValueError:
                values.append(0)  # Se não puder ser convertido, definir como 0

        # Plotar os dados apenas se houver valores maiores que 0
        bars = ax.bar(x, values, width=0.4, color='blue', alpha=0.6)

        # Adicionar os rótulos nas barras
        for bar, value in zip(bars, values):
            if value > 0:
                ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height(),
                        f'{value:.2f}%', ha='center', va='bottom')

        # Somente adicionar a legenda se houver barras plotadas
        if any([v > 0 for v in values]):
            ax.legend([player_name], loc="upper right")
        else:
            ax.text(5, 50, 'Sem dados', fontsize=12, ha='center')

        ax.set_title(category.capitalize())
        ax.set_ylim(0, 100)
        ax.grid(True)

    plt.suptitle(f'Estatísticas de {player_name}', fontsize=16)
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])

    return fig

# Função para criar gráficos comparativos lado a lado
def create_side_by_side_bar_chart(data1, data2, title, team1, team2, pdf):
    keys = sorted(set(data1.keys()).union(data2.keys()), key=int)
    values1 = [data1.get(key, 0) for key in keys]
    values2 = [data2.get(key, 0) for key in keys]
    labels = [str(key) for key in keys]
    x = range(len(keys))

    plt.figure(figsize=(12, 8))  # Garante que uma nova figura será criada
    width = 0.35
    plt.bar([p - width / 2 for p in x], values1, width=width, color='blue', alpha=0.6, label=team1)
    plt.bar([p + width / 2 for p in x], values2, width=width, color='red', alpha=0.6, label=team2)
    plt.title(title)
    plt.xlabel('Quantidade')
    plt.ylabel('Probabilidade (%)')
    plt.xticks(ticks=x, labels=labels)
    plt.grid(True)
    plt.legend(loc="upper right")
    plt.tight_layout()

    for i in range(len(x)):
        plt.text(x[i] - width / 2, values1[i] + 1, round(values1[i], 2), ha='center', va='bottom')
        plt.text(x[i] + width / 2, values2[i] + 1, round(values2[i], 2), ha='center', va='bottom')

    pdf.savefig()  # Salva a figura atual no PDF
    plt.close()  # Fecha a figura para liberar memória

# Função para criar gráficos de valor único
def create_single_value_chart(value1, value2, title, team1, team2, pdf):
    plt.figure(figsize=(10, 6))  # Garante que uma nova figura será criada
    bars = plt.bar([f"{team1}", f"{team2}"], [value1, value2], color=['blue', 'red'])
    plt.title(title)
    plt.ylim(0, 100)
    plt.ylabel('Probabilidade (%)')
    plt.tight_layout()

    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, yval + 1, round(yval, 2), ha='center', va='bottom')

    pdf.savefig()  # Salva a figura atual no PDF
    plt.close()  # Fecha a figura para liberar memória

# Função para criar gráficos de estatísticas de gols
def create_goal_charts(team1_goals, team2_goals, title, team1, team2, pdf):
    categories = ["total", "home", "away", "homeFirstHalf", "awayFirstHalf"]
    
    for category in categories:
        if category in team1_goals and category in team2_goals:
            plt.figure(figsize=(10, 6))  # Garante que uma nova figura será criada
            values1 = [team1_goals[category].get(str(i), 0) for i in range(1, 26)]
            values2 = [team2_goals[category].get(str(i), 0) for i in range(1, 26)]
            x = range(1, 26)

            plt.bar([p - 0.2 for p in x], values1, width=0.4, color='blue', alpha=0.6, label=team1)
            plt.bar([p + 0.2 for p in x], values2, width=0.4, color='red', alpha=0.6, label=team2)
            plt.title(f"{title} - {category.capitalize()}")
            plt.xlabel('Quantidade')
            plt.ylabel('Probabilidade (%)')
            plt.xticks(ticks=x)
            plt.grid(True)
            plt.legend(loc="upper right")
            plt.tight_layout()

            # Adicionar os valores em cima das barras
            for i in range(len(x)):
                plt.text(x[i] - 0.2, values1[i] + 1, round(values1[i], 2), ha='center', va='bottom')
                plt.text(x[i] + 0.2, values2[i] + 1, round(values2[i], 2), ha='center', va='bottom')

            pdf.savefig()  # Salva a figura atual no PDF
            plt.close()  # Fecha a figura para liberar memória

# Função para criar gráfico de probabilidade de vitória, empate e derrota
def create_result_probability_chart(victory, draw, defeat, team1, team2, pdf):
    plt.figure(figsize=(10, 6))  # Garante que uma nova figura será criada
    bars = plt.bar([f"{team1} Vitória", "Empate", f"{team2} Vitória"], [victory, draw, defeat], color=['blue', 'gray', 'red'])
    plt.title('Probabilidade de Resultado do Jogo')
    plt.ylim(0, 100)
    plt.ylabel('Probabilidade (%)')
    plt.tight_layout()

    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, yval + 1, round(yval, 2), ha='center', va='bottom')

    pdf.savefig()  # Salva a figura atual no PDF
    plt.close()  # Fecha a figura para liberar memória

# Endpoint para comparação de times
@app.route('/generate_pdf', methods=['GET'])
def generate_pdf():
    team1_name = request.args.get('team1')
    team2_name = request.args.get('team2')
    collection_name = request.args.get('collection')

    # Buscar os dados dos times na coleção específica
    collection_name = collection_name.replace(" ", "_")
    collection = database[collection_name]
    team1_data = collection.find_one({"teamName": team1_name})
    team2_data = collection.find_one({"teamName": team2_name})

    if not team1_data or not team2_data:
        return "Dados dos times não encontrados", 404

    # Calcular a probabilidade de vitória, empate e derrota (Exemplo simplificado)
    # victory_prob_team1 = 33  # Exemplo
    # draw_prob = 33  # Exemplo
    # victory_prob_team2 = 33  # Exemplo

    # Gerar o PDF
    pdf_buffer = io.BytesIO()
    with PdfPages(pdf_buffer) as pdf:
        # Primeira página: Probabilidade de Resultado
        # create_result_probability_chart(victory_prob_team1, draw_prob, victory_prob_team2, team1_name, team2_name, pdf)

        # Criar gráficos para "Escanteios", "Cartões Amarelos", "Impedimentos", "Tiro de meta", "Cobrança de lateral"
        for category in ["Escanteios", "Cartões Amarelos", "Impedimentos", "Tiro de meta", "Cobrança de lateral"]:
            if category in team1_data.get('statistics', {}) and category in team2_data.get('statistics', {}):
                title = f"Probabilidade de {category}"
                create_side_by_side_bar_chart(team1_data['statistics'][category], team2_data['statistics'][category], title, team1_name, team2_name, pdf)

        # Gráficos para "Chutes ao Gol"
        if "Chutes ao Gol" in team1_data.get('statistics', {}) and "Chutes ao Gol" in team2_data.get('statistics', {}):
            for subcategory in ["onTarget", "total"]:
                if subcategory in team1_data['statistics']["Chutes ao Gol"] and subcategory in team2_data['statistics']["Chutes ao Gol"]:
                    title = f"Probabilidade de Chutes ao Gol ({subcategory})"
                    create_side_by_side_bar_chart(team1_data['statistics']['Chutes ao Gol'][subcategory], team2_data['statistics']['Chutes ao Gol'][subcategory], title, team1_name, team2_name, pdf)

        # Gráficos de Gols
        if "Gols" in team1_data['statistics'] and "Gols" in team2_data['statistics']:
            create_goal_charts(team1_data['statistics']['Gols'], team2_data['statistics']['Gols'], "Estatísticas de Gols", team1_name, team2_name, pdf)

        # Criar gráficos para "Gols_Primeira_Parte" e "Gols_Segunda_Parte"
        for goal_category in ["Gols_Primeira_Parte", "Gols_Segunda_Parte"]:
            if goal_category in team1_data.get('statistics', {}) and goal_category in team2_data.get('statistics', {}):
                title = f"Probabilidade de {goal_category.replace('_', ' ')}"
                create_single_value_chart(team1_data['statistics'][goal_category], team2_data['statistics'][goal_category], title, team1_name, team2_name, pdf)

        # Criar gráficos para "Cartoes_Amarelos_Primeira_Parte" e "Cartoes_Amarelos_Segunda_Parte"
        for card_category in ["Cartoes_Amarelos_Primeira_Parte", "Cartoes_Amarelos_Segunda_Parte"]:
            if card_category in team1_data.get('statistics', {}) and card_category in team2_data.get('statistics', {}):
                title = f"Probabilidade de {card_category.replace('_', ' ')}"
                create_single_value_chart(team1_data['statistics'][card_category], team2_data['statistics'][card_category], title, team1_name, team2_name, pdf)

    pdf_buffer.seek(0)
    return send_file(pdf_buffer, as_attachment=True, download_name=f'{team1_name}vs{team2_name}.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)
