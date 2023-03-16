// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Foo1.sol";

contract Foo1Caller {
    Foo1 foo;
    constructor(address _fooAddress) {
        foo = Foo1(_fooAddress);
    }

    function callFoo() public view returns(bool){
        return foo.f();
    }
}


contract Foo2Caller {

    function call2Foo(Foo1 foo) public pure returns(bool){
        return foo.f();
    }
}