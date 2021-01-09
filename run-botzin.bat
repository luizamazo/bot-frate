title Botzin Italiano 
SET /P email = Digite o prefixo do email 
echo O padrão do email será: prefixoNumero@emailTemporario.com
SET /P minimo = Digite o número mínimo de um intervalo
echo Exemplo: intervalo de 0 a 10, digite 0 
SET /P maximo = Digite o número máximo de um intervalo; Recomendo que não ultrapasse 1000
echo Exemplo: intervalo de 0 a 10, digite 10
echo Importante: Não troque a ordem dos números! O primeiro digitado deve ser menor que o segundo

node botzin.js %email% %minimo %maximo% 