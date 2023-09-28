export default function dbAdmin() {
  return [
    {
      $addFields: {
        credentialChangeAt: {
          $cond: [
            {
              $eq: [
                {
                  $type: "$credentialChangeAt",
                },
                "missing",
              ],
            },
            new Date(),
            "$credentialChangeAt",
          ],
        },
        phone: "$phoneNumber",
        phoneNumber: "$$REMOVE",
        token: "$$REMOVE",
        type: "$$REMOVE",
        role: "admin",
      },
    },
    {
      $addFields: {
        firstName: {
          $function: {
            lang: "js",
            args: ["$nickname"],
            body: function (name = "") {
              const sn = name.split(" ");
              return sn[0];
            }.toString(),
          },
        },
        lastName: {
          $function: {
            lang: "js",
            args: ["$nickname"],
            body: function (name = "") {
              const sn = name.split(" ");
              return sn.slice(1).join(" ");
            }.toString(),
          },
        },
        nickname: "$$REMOVE",
      },
    },
    {
      $out: "admins",
    },
  ];
}
