# Lambda convert-to-pdf-v3

Manual com o objetivo de esclarecer todos os passos que foram executados para criar esse lambda.
Esse lambda conversor de `docx` para `pdf` foi criado a partir de uma imagem docker fornecida pelo repositório abaixo.

- https://github.com/shelfio/libreoffice-lambda-base-image

O projeto atual compila essa imagem e deixa pronto para enviar para o repositório na AWS.

## Conhecimento prévio

- Docker
- Amazon AWS
  - AWS Elastic Container Service
  - AWS Lambda
  - AWS CLI instalado
- Programação
  - NodeJs 20.x

## Requisitos de sistema operacional

As ferramentas abaixo, precisam estar instaladas na sua máquina antes de prosseguir.

- Docker
- AWS CLI (Autenticado com um usuário da conta AWS para onde a imagem vai ser enviada)

## Dependências da aplicação

- **@shelf/aws-lambda-libreoffice** (Lib que utiliza o libreoffice para geração do PDF) 
- **aws-sdk** (Lib que possibilita utilizar serviços da AWS)

### Instalação das dependências

```sh
$ docker run --rm --interactive --tty --user $(id -u):$(id -g) -w /app -v $PWD:/app node:20-alpine npm install --verbose
```

## Construção e atualização da imagem no repositório da AWS

Para seguir adiante, é necessário ter instalado as dependências da aplicação conforme mencionado acima.
Se o comando abaixo não funcionar na sua conta, acesse o serviço ECR (Elastic Container Registry), clique no 
repositório e em seguida clique na opção **Visualizar comandos push**.

O processo de criação e atualização do repositório se resume em três passos.

### 1. Construção da imagem localmente

```sh
$ docker build -t lambda-libreoffice .
```
Flag|Descrição
-----|------
-t|Define um nome para a imagem

### 2. Definição de Tags

Utilizar tag é mesmo que definir uma versão para a sua imagem. É comum utilizar a tag `latest` para definir que essa é a 
versão mais atualizada. No entanto, você pode definir qualquer definição mais apropriada.

```sh
$ docker tag lambda-libreoffice:latest 711333918179.dkr.ecr.us-east-1.amazonaws.com/lambda-libreoffice:latest
```

### 3. Enviar imagem para o respositório da AWS

O comando abaixo vai enviar a imagem construida localmente para o repositório da AWS.

```sh
$ docker push 711333918179.dkr.ecr.us-east-1.amazonaws.com/lambda-libreoffice:latest
```

## Lambda criar e testar o lambda

Após enviar a imagem para o repositório da AWS, executei os passos abaixo na AWS.

- Acessei o serviço Lambdas
  - Cliquei em criar função
  - Selecione a opção para criar o lambda a partir de uma imagem de contêiner
  - Selecionei o repositório e a imagem que acabamos de subir
  - Confirmei a criação da função..
- Acessei o serviço IAM
  - Selecionei o usuário que o lambda criou
  - Adicionei a politica para utilizar o serviço S3 com as permissões 
    - s3:GetObject
    - s3:PutObject
    - s3:DeleteObject
- Acessei o serviço S3
  - Criei um bucket chamado `uni-lambda-operacao`
  - Criei uma pasta chamada `teste`
  - Carreguei um arquivo chamado `documento.docx` dentro da pasta teste. Usei como base o arquivo que está na pasta `example`
- Acessei o serviço Lambdas
  - Selecionei meu lambda criado a partir da imagem
  - Cliquei na aba `Testar` 
  - Adicionei a informação abaixo no formato JSON e cliquei em `Testar`

```json
{
  "filename": "teste/documento.docx"
}
```
## Testar apenas o conversor localmente

```sh
$ docker run -it -v ./example:/tmp -v ./:/var/task --entrypoint=/bin/bash lambda-libreoffice:latest
$ cd /var/task
$ 
```

O resultado é um arquivo chamado `documento.pdf` gerado no bucket e na pasta de teste.

## Informações adicionais

As informações abaixo são apenas para conhecimento. Não é necessário realizar nenhuma ação.

### Comando que o conversor roda

O nome do arquivo é passado pela aplicação que está usando o lambda. No exemplo abaixo, usamos um nome fixo.

```sh
$ libreoffice7.6 --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp 'teste/documento.docx'
```

o comando `libreoffice7.6` é um alias para `/opt/instdir/program/soffice`. Seria o mesmo que executar o
comando:

```sh
$ /opt/instdir/program/soffice --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp 'teste/documento.docx'
```

### Criar link simbólico

```sh
$ ln -s /opt/libreoffice7.6/program/soffice /usr/bin/libreoffice7.6
```
## Solução de problemas

Command failed: Fatal Error: The application cannot be started. User installation could not be completed.
Set environment variable HOME=/tmp in your Lambda function.

> Falha no comando: Erro fatal: O aplicativo não pode ser iniciado. A instalação do usuário não pôde ser concluída. 
Defina a variável de ambiente HOME=/tmp em sua função Lambda.
