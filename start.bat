@echo off
:: Verificar se o Chocolatey está instalado
choco -v >nul 2>nul
if %errorlevel% neq 0 (
    echo Chocolatey não está instalado. Por favor, instale-o antes de continuar.
    pause
    exit /b
)

:: Instalar dependências usando Chocolatey
echo Instalando dependências principais...
choco install -y nodejs ruby figlet ffmpeg git

:: Verificar se Ruby está instalado
where ruby >nul 2>nul
if %errorlevel%==0 (
    echo Ruby detectado, prosseguindo...
    timeout /t 1 >nul
    :: Verificar se lolcat está instalado
    gem list lolcat -i >nul 2>nul
    if %errorlevel%==0 (
        echo Lolcat detectado, prosseguindo...
        timeout /t 1 >nul
    ) else (
        echo Lolcat não detectado, instalando...
        gem install lolcat
    )
) else (
    echo Ruby não foi detectado. Algo deu errado com a instalação do Ruby via Chocolatey.
    pause
    exit /b
)

:: Limpar tela
cls
figlet -c -f slash "FURRYZ-MD" | lolcat

echo Instalando dependências adicionais com npm...
npm install

echo Instalando dados de treinamento do Tesseract...
:: Baixar o arquivo de treinamento (exemplo de comando curl usando Chocolatey)
curl -o %ProgramFiles%\Tesseract-OCR\tessdata\ind.traineddata ^
    https://github.com/tesseract-ocr/tessdata/raw/main/ind.traineddata

echo Tudo pronto! Agora você pode usar o comando "npm start".
echo [*] Todas as dependências foram instaladas. Execute o comando "npm start" para iniciar o script imediatamente.
pause
