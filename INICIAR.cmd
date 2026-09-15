@echo off
cd /d "%~dp0"
echo Portal Contabilidade - servidor de arquivos local
echo Abra http://localhost:5500/ e escolha seu nome na tela inicial
echo Para encerrar, pressione Ctrl+C nesta janela.
where python >nul 2>nul
if %errorlevel% equ 0 (
  python -m http.server 5500 --bind 127.0.0.1
) else (
  where py >nul 2>nul
  if %errorlevel% equ 0 (
    py -m http.server 5500 --bind 127.0.0.1
  ) else (
    echo Python nao encontrado. Use um servidor de arquivos estaticos ja disponivel.
    echo Consulte o README.md. O portal nao exige Node.js ou npm.
  )
)
pause
