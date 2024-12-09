response=$(curl -o /dev/null -s -w "%{http_code}\n" -X GET http://localhost:3333)
if [ "$response" -eq 200 ]; then
    echo "Success!"
    exit 0
  else
    echo "Failed with status $response."
    exit 1
fi
