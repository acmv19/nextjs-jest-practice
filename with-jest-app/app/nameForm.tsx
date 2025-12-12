"use client";
import { useState } from "react";

export default function NameForm() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  const handleSubmit = () => {
    setGreeting(`Hello, ${name}!`);
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={handleSubmit}>Greet me</button>
      {greeting && <h1>{greeting}</h1>}
    </div>
  );
}
