import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import axios from "axios";

function App() {
  const query = useQuery({
    queryKey: ["store"],
    queryFn: async () => await axios.get("https://fakestoreapi.com/products"),
  });

  console.log(query);

  const { mutate , isError, isPending } = useMutation({
    mutationKey: ["test"],
    mutationFn: async (prd) => await axios.post("https://fakestoreapi.com/products",prd),
    onSuccess: (data) => {},
    onError: (err) => {},
  });
  
  const product = {
    id: 0,
    title: "string",
    price: 0.1,
    description: "string",
    category: "string",
    image: "http://example.com",
  };

  return (
    <div>
      <button onClick={() => mutate(product)}>ClickMe</button>
    </div>
  );
}

export default App;
