input="./portfolios.txt"
while IFS= read -r line
do
  args=(${line//:/ })
  if [[ ${args[0]} == \#* ]] ;
  then
    :
  else
    yarn get --portfolio=${args[0]}
  fi
done < "$input"