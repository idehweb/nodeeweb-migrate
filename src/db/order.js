export default function dbOrder() {
  return [
    {
      $lookup: {
        from: "transactions",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                order: "$$id",
              },
              Authority: {
                $exists: true,
              },
            },
          },
        ],
        as: "transaction",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $function: {
            lang: "js",
            args: ["$$ROOT"],
            body: function (doc) {
              const order = {};
              order._id =
                typeof doc._id === "string"
                  ? doc._id
                  : doc.orderNumber
                  ? doc.orderNumber + ""
                  : doc.order_id;

              // customer
              if (doc.customer_data) {
                order.customer = {};
                ["firstName", "lastName", "username", "email"].forEach(
                  (k) => (order.customer[k] = doc.customer_data[k])
                );
                order.customer.phone = doc.customer_data.phoneNumber;
                if (doc.customer_data._id)
                  order.customer._id = new ObjectId(doc.customer_data._id);
              }
              const products = doc.package
                .map((product) => {
                  const [pId, comId] = product.product_id.split("DDD");
                  return Object.assign({}, product, {
                    pId,
                    comId,
                  });
                })
                .reduce((prev, curr) => {
                  if (!prev[curr.pId]) prev[curr.pId] = [];
                  prev[curr.pId].push(curr);
                  return prev;
                }, {});
              order.products = [];
              for (pId in products) {
                const p = products[pId].reduce((prev, curr) => {
                  prev._id = new ObjectId(curr.pId);
                  prev.title = {
                    fa: curr.product_name,
                  };
                  if (!prev.combinations) prev.combinations = [];
                  prev.combinations.push({
                    _id: curr.comId,
                    price: curr.price,
                    salePrice: curr.salePrice || curr.price,
                    weight: curr.weight,
                    quantity: curr.quantity,
                  });
                  return prev;
                }, {});
                order.products.push(p);
              }

              // discount
              if (doc.discountCode) {
                order.discount = {
                  code: doc.discountCode,
                  amount: doc.discount,
                };
              }

              // tax
              if (doc.tax) order.tax = doc.tax;

              // address
              if (doc.billingAddress) {
                const adr = {
                  state: doc.billingAddress.State,
                  city: doc.billingAddress.City,
                  street: doc.billingAddress.StreetAddress,
                  postalCode: doc.billingAddress.PostalCode,
                  receiver: {
                    phone: doc.billingAddress.PhoneNumber,
                  },
                };
                order.address = adr;
              }

              // post
              if (doc.deliveryDay) {
                order.post = {
                  title: doc.deliveryDay.title,
                  description: doc.deliveryDay.description,
                };
              }

              // total
              order.totalPrice = doc.amount;

              // transaction
              if (doc.transaction.length) {
                const t = doc.transaction[0];
                order.transaction = {
                  provider: "zibal",
                  payment_link: `https://gateway.zibal.ir/start/${t.Authority}`,
                  authority: t.Authority,
                  createdAt: t.createdAt,
                  expiredAt: new Date(t.createdAt.getTime() + 15 * 60 * 1000),
                };
              }

              // status
              doc.status = "need-to-pay";
              switch (doc.status) {
                case "cart":
                  order.status = "cart";
                  break;
                case "complete":
                  order.status = "completed";
                  break;
                case "checkout":
                  order.status = "checkout";
                  break;
                case "makingready":
                  order.status = "paid";
                  break;
                case "inpeyk":
                  order.status = "posting";
                  break;
                case "cancel":
                  order.status = "canceled";
                  break;
              }

              // times
              order.statusChangedAt = new Date();
              order.createdAt = doc.createdAt;
              order.updatedAt = doc.updatedAt;
              order.active =
                doc.active !== undefined
                  ? doc.active
                  : doc.status === "trash"
                  ? false
                  : true;
              return order;
            }.toString(),
          },
        },
      },
    },
    {
      $out: "orders",
    },
  ];
}
