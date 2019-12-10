import ReactMarkdown from "react-markdown";
import React, { useState, useEffect } from "react";

const Docs = () => {
  const [docs, setDocs] = useState("");

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/davidmargolin/Congo/master/README.md"
    )
      .then(res => res.text())
      .then(markdown => setDocs(markdown));
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
      <span style={{ maxWidth: 800, padding: 16 }}>
        For more information check out{" "}
        <a
          style={{ color: "blue" }}
          target="_blank"
          href="https://github.com/davidmargolin/congo"
        >
          the Congo Github repo.
        </a>
        <ReactMarkdown skipHtml source={docs} />
      </span>
    </div>
  );
};

export default Docs;
