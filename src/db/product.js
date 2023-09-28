// TODO deeply remove undefined properties
export default function dbProduct() {
  return [
    {
      $addFields: {
        photos: {
          $map: {
            input: "$photos",
            in: {
              $cond: [
                {
                  $eq: [
                    {
                      $type: "$$this",
                    },
                    "string",
                  ],
                },
                {
                  $concat: ["/", "$$this"],
                },
                "$$this",
              ],
            },
          },
        },
        thumbnail: {
          $cond: [
            {
              $eq: [
                {
                  $type: "$thumbnail",
                },
                "missing",
              ],
            },
            "$thumbnail",
            {
              $concat: ["/", "$thumbnail"],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "files",
        localField: "photos",
        foreignField: "url",
        as: "photos",
        pipeline: [
          {
            $project: {
              url: 1,
            },
          },
        ],
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $function: {
            lang: "js",
            args: ["$$ROOT"],
            body: function (product) {
              function slugify(str = "") {
                return str.trim().replace(/\s/g, "-").toLowerCase();
              }
              function toNumber(str = "", def) {
                if (!str) return def;
                const myNum = +str;
                if (Number.isNaN(myNum)) return def;
                return myNum;
              }
              const PriceType = {
                Normal: "normal",
                Variable: "variable",
              };
              const PublishStatus = {
                Published: "published",
                Processing: "processing",
              };
              let status;
              if (product.status) {
                switch (product.status) {
                  case PublishStatus.Processing:
                    status = PublishStatus.Processing;
                    break;
                  default:
                    status = PublishStatus.Published;
                    break;
                }
              }
              const out = {
                _id: product._id,
                title: product.title,
                slug: product.slug || slugify(product.slug),
                photos: product.photos,
                thumbnail: product.thumbnail,
                labels: product.labels,
                attributes: product.attributes,
                extra_attr: product.extra_attr,
                status,
                miniTitle: product.miniTitle,
                active: true,
                excerpt: product.excerpt,
                description: product.description,
                metatitle: product.metatitle,
                metadescription: product.metadescription,
                productCategory: product.productCategory,
              };
              let extraOut;
              if (product.type === "normal") {
                extraOut = {
                  price_type: PriceType.Normal,
                  options: [],
                  combinations: [
                    {
                      _id: Math.ceil(Math.random() * 1000000) + "",
                      price: toNumber(product.price),
                      salePrice: toNumber(
                        product.salePrice,
                        toNumber(product.price)
                      ),
                      in_stock: product.in_stock,
                      quantity: toNumber(product.quantity),
                      weight: toNumber(product.weight),
                    },
                  ],
                };
              } else if (product.type === "variable") {
                extraOut = {
                  price_type: PriceType.Variable,
                  combinations: product.combinations.map((comb) => ({
                    _id: comb.id,
                    in_stock: comb.in_stock || true,
                    price: toNumber(comb.price + ""),
                    quantity: toNumber(comb.quantity + ""),
                    salePrice: toNumber(
                      comb.salePrice + "",
                      toNumber(comb.price + "")
                    ),
                    sku: comb.sku,
                    weight: toNumber(comb.weight + ""),
                    options: comb.options,
                  })),
                  options: product.options.map((opt) => ({
                    _id: opt.id,
                    name: opt.name,
                    values: opt.values.map((v) => ({
                      name: v.name,
                    })),
                  })),
                };
              }
              const finalResult = Object.assign({}, out, extraOut);
              return JSON.parse(JSON.stringify(finalResult));
            }.toString(),
          },
        },
      },
    },
    {
      $out: "products",
    },
  ];
}
