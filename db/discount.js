export default function dbDiscount() {
  return [
    {
      $replaceRoot: {
        newRoot: {
          $function: {
            lang: "js",
            args: ["$$ROOT"],
            body: function (doc) {
              const discount = {};
              discount._id = doc._id;
              discount.code = doc.slug;
              discount.name = doc.name;
              discount.amount = doc.price;
              discount.maxAmount = Number.MAX_SAFE_INTEGER;
              discount.usageLimit = doc.count;
              discount.active = true;
              [
                "excludeDiscount",
                "excludeDiscountCategory",
                "includeDiscount",
                "includeDiscountCategory",
              ].forEach((k) => (discount[k] = []));
              discount.createdAt = new Date();
              discount.updatedAt = new Date();

              return JSON.parse(JSON.stringify(discount));
            }.toString(),
          },
        },
      },
    },
    {
      $out: "discounts",
    },
  ];
}
