export default function dbNotification() {
  return [
    {
      $replaceRoot: {
        newRoot: {
          $function: {
            lang: "js",
            args: ["$$ROOT"],
            body: function (doc) {
              const notif = {};
              notif._id = doc._id;
              notif.message = doc.message;
              notif.status = "send_success";
              notif.source = doc.source;
              notif.from = doc.from;
              notif.phone = doc.phoneNumber;
              notif.createdAt = doc.createdAt;
              notif.updatedAt = doc.updatedAt;

              return JSON.parse(JSON.stringify(notif));
            }.toString(),
          },
        },
      },
    },
    {
      $out: "notifications",
    },
  ];
}
