export default function dbMedia() {
  return [
    {
      $replaceRoot: {
        newRoot: {
          $function: {
            lang: "js",
            args: ["$$ROOT"],
            body: function (doc) {
              const type = doc.type ? doc.type.split("/")[0] : undefined;
              const url = `/${doc.url}`;
              doc.url = url;
              doc.type = type;

              return doc;
            }.toString(),
          },
        },
      },
    },
    {
      $out: "files",
    },
  ];
}
