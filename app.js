const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(
    "mongodb+srv://$USERNAME:$PASS@$mongodb.net/todolistDB"
  );
  // await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB"); // Connect to local server.

  console.log("Connecting to mongo DB Atlas");

  // CREATING NEW SCHEMA// .3 ?? WITHOUT THE "NEW" KEYWORD??? Yes. I can construct schema without mongoose but it's better with in case I would like some fancy thing on top.

  const itemsSchema = new mongoose.Schema({
    name: String,
  });

  // CREATING NEW MODEL // .4

  const Item = mongoose.model("Item", itemsSchema);

  // CREATING NEW DOCUMENTS FROM THE Item Module// .6

  const item1 = new Item({
    name: "Welcome to your todolist!",
  });

  const item2 = new Item({
    name: "Hit the + button to add a new item.",
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item.",
  });

  // INSERTING NEW items FROM THE Item Module TO ARRAY// .7

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema],
  };

  const List = mongoose.model("List", listSchema);

  // inserting the new items to the DB // .8

  // await Item.insertMany(defaultItems);
  // console.log("Successfully saved my default Item to the Database");

  ///////////////EXISTING CODE////////////////////// .5 simplified the code removed 'date' module related items.

  app.get("/", function (req, res) {
    const foundItems = Item.find({});
    foundItems.then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems).then(function () {
          console.log("Successfully saved my default Items to the Database");
          res.redirect("/");
        });
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    });
  });

  app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName,
    });
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }).then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  });

  app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId).exec(); // Had to add .exec() to execute otherwise it's just like a query. In Angela's she had to add callback funcion for it to actually execute.
      res.redirect("/");
    } else {
      List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      ).then(function (foundList) {
        if (foundList) {
          res.redirect("/" + listName);
        }
      });
    }
  });

  app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }).then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    });
  });

  // app.get("/work", function (req, res) {
  //   res.render("list", { listTitle: "Work List", newListItems: workItems });
  // });

  app.get("/about", function (req, res) {
    res.render("about");
  });

  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });

  // mongoose.connection.close();

  ///////////////EXISTING CODE//////////////////////
}
