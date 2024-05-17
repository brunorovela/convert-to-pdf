const {writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync} = require('fs');
const {dirname, basename} = require('path');
const {S3} = require('aws-sdk');
const {convertTo, canBeConvertedToPDF} = require('@shelf/aws-lambda-libreoffice');

const dsBucketS3 = 'uni-lambda-operacao';

const s3 = new S3({params: {Bucket: dsBucketS3}});

module.exports.handler = async ({filename}) => {
    let result, inputFileBuffer;

    try {
        // Pega o arquivo diretamente do S3
        result = await s3
            .getObject({Key: filename})
            .promise();

        inputFileBuffer = result.Body;
    } catch (err) {
        console.log('Erro: ' + err)
        return false;
    }

    // Verifica se a estrutura de pasta repassada no filename
    // existe no servidor do LAMBDA, se nao existir cria ela
    if (!existsSync(`/tmp/${dirname(filename)}`)) {
        mkdirSync(
            `/tmp/${dirname(filename)}`,
            { recursive: true }
        );
    }

    // Move o arquivo do S3 para o servidor temporario levantado pelo LAMBDA
    // O arquivo eh colocado temporariamente para conversao depois eh removido
    writeFileSync(`/tmp/${filename}`, inputFileBuffer);

    // Assumindo que o arquivo exista dentro do diretorio /tmp
    // O arquivo original sera removido apos a conversao
    if (!canBeConvertedToPDF(filename)) {
        return false;
    }

    // Converte o DOCX para PDF
    // Remove o arquivo DOCX do diretorio /tmp do LAMBDA
    const dsArquivoPDF = await convertTo(filename, 'pdf');

    // Recupera o nome do arquivo
    // Ex.: "/tmp/pasta/nm_arquivo.docx" => "nm_arquivo.docx"
    const dsPathArquivoPDF = dirname(filename) + '/' + basename(dsArquivoPDF);

    // Retorna o buffer stream do arquivo PDF
    const outputFileBuffer = readFileSync(dsArquivoPDF);

    // Envia o arquivo convertido para o BUCKET (uni-lambda-operacao)
    await s3
        .upload({
            Key: dsPathArquivoPDF,
            Body: outputFileBuffer,
            ContentType: 'application/pdf'
        })
        .promise();

    // Apaga o arquivo PDF do servidor LAMBDA se ele existir
    // libera espaco em disco
    if (existsSync(dsArquivoPDF)) {
        await unlinkSync(dsArquivoPDF);
    }

    // Retorno o caminho para o arquivo convertido em um BUCKET
    // que apaga arquivos antigos
    return `https://s3.amazonaws.com/${dsBucketS3}/${dsPathArquivoPDF}`;
};
