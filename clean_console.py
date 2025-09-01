import re

# Ler o arquivo
with open('src/pages/metabase/index.js', 'r', encoding='utf-8') as file:
    content = file.read()

# Remover console.log statements (incluindo multi-linha)
# Padrão para encontrar console.log com parênteses e ponto e vírgula
pattern = r'^\s*console\.log\([^)]*\);?\s*$'
content = re.sub(pattern, '', content, flags=re.MULTILINE)

# Padrão para encontrar console.log com objetos multi-linha
pattern2 = r'console\.log\([^)]*\);'
content = re.sub(pattern2, '', content)

# Remover linhas vazias extras
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

# Escrever o arquivo limpo
with open('src/pages/metabase/index.js', 'w', encoding='utf-8') as file:
    file.write(content)

print("Console.log statements removidos com sucesso!")
