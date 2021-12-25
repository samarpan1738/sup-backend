-- CreateEnum
CREATE TYPE "message_type" AS ENUM ('TEXT', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "conversation_type" AS ENUM ('CONTACT', 'GROUP');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "profile_pic_uri" TEXT NOT NULL,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT E'Hey there! I\'m using Sup',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "text" TEXT,
    "file_uri" TEXT,
    "type" "message_type" NOT NULL DEFAULT E'TEXT',
    "sender_id" INTEGER NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "type" "conversation_type" NOT NULL DEFAULT E'CONTACT',
    "hash" TEXT,
    "description" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_icon_url" TEXT,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_in_conversation" (
    "user_id" INTEGER NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_in_conversation_pkey" PRIMARY KEY ("user_id","conversation_id")
);

-- CreateTable
CREATE TABLE "conversation_message_for_user" (
    "user_id" INTEGER NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "message_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN DEFAULT FALSE,

    CONSTRAINT "conversation_message_for_user_pkey" PRIMARY KEY ("conversation_id","message_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_hash_key" ON "conversation"("hash");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_conversation" ADD CONSTRAINT "user_in_conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_conversation" ADD CONSTRAINT "user_in_conversation_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_message_for_user" ADD CONSTRAINT "conversation_message_for_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_message_for_user" ADD CONSTRAINT "conversation_message_for_user_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_message_for_user" ADD CONSTRAINT "conversation_message_for_user_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
