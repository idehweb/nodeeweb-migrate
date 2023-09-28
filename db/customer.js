export default function dbCustomer() {
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
        tokens: "$$REMOVE",
        type: "$$REMOVE",
        role: "customer",
      },
    },
    {
      $out: "customers",
    },
  ];
}
