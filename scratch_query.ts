import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const journals = await prisma.journals.findMany({
    where: { UserId: null }
  });
  console.log('Journals with null UserId:', journals);
}
main().catch(console.error);
