FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.6-node20-x86_64

# A instalação das libs abaixo é para resolver a mensagem
# que aparece no momento da conversão e aplicar as fonts corretamente.
# - javaldx: Could not find a Java Runtime Environment!
# - Warning: failed to read path from javaldx
RUN dnf update -y && \
    dnf install -y \
        dejavu-sans-fonts \
        dejavu-serif-fonts \
        java-1.8.0-amazon-corretto-1:1.8.0_362.b08-1.amzn2023.x86_64

# Copia as dependências da aplicação para dentro da imagem na pasta /var/task
COPY handler.js ${LAMBDA_TASK_ROOT}/
COPY example/documento.docx /tmp
COPY node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY package.json ${LAMBDA_TASK_ROOT}/package.json
COPY package-lock.json ${LAMBDA_TASK_ROOT}/package-lock.json

# Executa o lambda no momento que o contaiber sobe
CMD [ "handler.handler" ]