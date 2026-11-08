
const prisma = require("../src/database/prisma");

async function main() {
  const movies = [
    {
      movieTitle: "Avengers: Endgame",
      screenName: "Screen 1",
      startsAt: new Date("2026-11-10T14:00:00Z"),
    },
    {
      movieTitle: "Interstellar",
      screenName: "Screen 2",
      startsAt: new Date("2026-11-10T18:00:00Z"),
    },
  ];

  for (const movie of movies) {
    const show = await prisma.show.create({
      data: {
        ...movie,
        seats: {
          create: [
            { seatNumber: "A1", category: "GENERAL", price: 150 },
            { seatNumber: "A2", category: "GENERAL", price: 150 },
            { seatNumber: "A3", category: "PREMIUM", price: 250 },
            { seatNumber: "A4", category: "PREMIUM", price: 250 },
            { seatNumber: "A5", category: "RECLINER", price: 400 },
          ],
        },
      },
    });

    console.log(`Created ${show.movieTitle}, ID: ${show.id}`);
  }

  console.log("Cinema sample data created successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
