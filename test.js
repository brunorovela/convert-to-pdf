const { convertTo } = require("@shelf/aws-lambda-libreoffice");

exports.handler = async (event, context) => {
    try {
        console.log('Iniciando conversão...');

        // Converte o DOCX para PDF
        await convertTo('documento.docx', 'pdf');

        console.log('Conversão concluída.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Arquivo convertido e salvo em /tmp/documento.pdf" })
        };
    } catch (error) {
        console.error('Ocorreu um erro durante a conversão:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erro ao converter o arquivo." })
        };
    }
};

// Chamando o handler manualmente com um objeto vazio como evento
exports.handler({}, {}, (err, result) => {
    if (err) {
        console.error('Erro ao chamar o handler:', err);
    } else {
        console.log('Resultado do handler:', result);
    }
});