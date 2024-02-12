set /p parserPath=Enter parser path:
call mklink /j "parser" "%parserPath%"
pause