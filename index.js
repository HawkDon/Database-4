var neo4j = require("neo4j-driver");
var driver = neo4j.driver(
  "bolt://52.23.212.255:33391",
  neo4j.auth.basic("neo4j", "adaptions-guard-downgrades")
);

// 1
var firstQuery =
  "MATCH (g:Genre)-[r:IN_GENRE]-(m:Movie) \
    RETURN g.name AS Genre, count(r) as Relations ORDER BY count(r) DESC LIMIT 1";

// 2
var secondQuery =
  'MATCH (m:Movie { title: "Toy Story" })<-[:RATED]-(u:User) \
    WITH count(u) as users \
    MATCH (m:Movie { title: "Toy Story" })<-[:ACTED_IN]-(a:Actor) \
    WITH users, count(a) as actors \
    MATCH (m:Movie { title: "Toy Story" })-[:IN_GENRE]->(g:Genre) \
    WITH users, actors, count(g) as genres \
    MATCH (m:Movie { title: "Toy Story" })<-[:DIRECTED]-(d:Director) \
    RETURN users, actors,genres, count(d) as directors';

// 3
var thirdQuery =
  'MATCH (movie:Movie)-[:IN_GENRE]-(g:Genre) \
    WHERE g.name = "Adventure" \
    return movie.title AS title';

// 4
var fourthQuery =
  'MATCH (tom:Actor { name: "Tom Hanks"}), (hugo:Actor { name: "Hugo Weaving"}), p = shortestPath((tom)-[*..10]-(hugo)) \
    RETURN p';

var session = driver.session();

session
  .run(firstQuery)
  .then(function (result) {
    result.records.forEach((record) => {
      console.log(
        "1. Most important genre node is: " +
          record.get("Genre") +
          " with: " +
          record.get("Relations") +
          " Relations"
      );
    });
  })
  .then(function () {
    session
      .run(secondQuery)
      .then(function (result) {
        result.records.forEach((record) => {
          console.log("2. All Closest relations to the Toy Story movie:");
          console.log("User relations: " + record.get("users"));
          console.log("Genre relations: " + record.get("genres"));
          console.log("Actor relations: " + record.get("actors"));
          console.log("director relations: " + record.get("directors"));
        });
      })
      .then(function () {
        session
          .run(thirdQuery)
          .then(function (result) {
            console.log(
              "3. All Movies that is apart of the 'adventure' genre:"
            );
            result.records.forEach((record) => {
              console.log(record.get("title"));
            });
          })
          .then(function () {
            session
              .run(fourthQuery)
              .then(function (result) {
                result.records.forEach((record) => {
                  console.log(
                    "The shortest path inbetween 'Tom Hanks' and 'Hugo Weaving' is: " +
                      record.get("p").segments.reduce(function (prev, curr) {
                        return (prev += 1);
                      }, 0) +
                      " relations"
                  );
                });
              })
              .then(function () {
                driver.close();
              })
              .catch(function (error) {
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  })
  .catch(function (error) {
    console.log(error);
  });
