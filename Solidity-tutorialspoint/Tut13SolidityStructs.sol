// https://www.tutorialspoint.com/solidity/solidity_structs.htm
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tut13SolidityStructs {
   struct Book { 
      string title;
      string author;
      uint book_id;
   }
   Book book;

   function setBook() public {
      book = Book('Learn Java', 'TP', 1);
   }
   function getBookId() public view returns (uint) {
      return book.book_id;
   }
   
   function getBookInfo() public view returns (Book memory) {
      return book;
   }
}