@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\plugins\ntract-cli\index.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\plugins\ntract-cli\index.js" %*
)