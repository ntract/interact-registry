@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\plugins\interact-cli\index.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\plugins\interact-cli\index.js" %*
)