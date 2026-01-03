# Guia de Implantação na Hostinger

Este guia explica como subir seu projeto React/Vite para a Hostinger.

## Pré-requisitos

1.  Acesso ao painel da Hostinger (hPanel).
2.  Conta de FTP ou acesso ao Gerenciador de Arquivos.

## Passo 1: Gerar a Build

No seu terminal local, execute:

```bash
npm run build
```

Isso criará uma pasta chamada `dist` no seu projeto. Esta pasta contém todos os arquivos otimizados para produção.

## Passo 2: Configurar Variáveis de Ambiente

Como este é um site estático, as variáveis de ambiente (como `GEMINI_API_KEY`) são injetadas durante o processo de build.

1.  Certifique-se de que o arquivo `.env.local` contém sua chave (já configurada):
    ```
    GEMINI_API_KEY=AIzaSyC9_1TSAV0-LwZoB9aJoHtByg_aI9W_eLk
    API_KEY=AIzaSyC9_1TSAV0-LwZoB9aJoHtByg_aI9W_eLk
    ```
2.  Quando você rodar `npm run build`, o Vite substituirá `process.env.API_KEY` pela sua chave real nos arquivos gerados.

## Passo 3: Upload para a Hostinger

### Opção A: Via Gerenciador de Arquivos (Recomendado)

1.  Acesse o **hPanel** da Hostinger.
2.  Vá em **Arquivos > Gerenciador de Arquivos**.
3.  Acesse a pasta `public_html`.
4.  Suba todo o conteúdo de dentro da pasta `dist` (não a pasta `dist` em si, apenas o que está dentro dela).
5.  O arquivo `.htaccess` já está incluído na pasta `dist`, então ele será enviado automaticamente.

### Opção B: Via Git (Integração Hostinger)

Se você usa Git, pode configurar a integração automática no hPanel em **Avançado > GIT**.

## Passo 4: Verificação

1.  Acesse seu domínio (ex: `seusite.com.br`).
2.  Teste as funcionalidades e verifique se as rotas e a IA estão funcionando.

---

> [!IMPORTANT]
> O arquivo `.htaccess` é fundamental para que, se você atualizar a página, o servidor não retorne erro 404. Ele redireciona todas as rotas para o `index.html`.
