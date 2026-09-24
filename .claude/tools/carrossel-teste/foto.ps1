param([int]$Largura = 1440, [int]$Altura = 2400, [string]$Nome = 'slides', [string]$Consulta = '')
# Fotografa a pagina de teste do carrossel (servidor.py no ar) com o Edge
# headless. A imagem vai para %TEMP%\portal-carrossel-teste\<Nome>.png.
#   .\foto.ps1 -Largura 1440 -Altura 1180 -Nome capa -Consulta '?so=1,2,6'
#   .\foto.ps1 -Largura 600 -Altura 1950 -Nome celular -Consulta '?gutter=16&largura=343'
$saidaDir = Join-Path $env:TEMP 'portal-carrossel-teste'
New-Item -ItemType Directory -Force $saidaDir | Out-Null
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$saida = Join-Path $saidaDir "$Nome.png"
$url = "http://127.0.0.1:5599/__teste.html$Consulta"
Start-Process -FilePath $edge -ArgumentList @('--headless=new', '--incognito', '--disable-gpu', '--hide-scrollbars', "--window-size=$Largura,$Altura", "--user-data-dir=$saidaDir\perfil", "--screenshot=$saida", '--virtual-time-budget=4000', $url) -Wait
Get-Item $saida | Select-Object FullName, Length
