pragma solidity ^0.5.0;

import "./EstateFactory.sol";
import "./GPAToken.sol";

contract AuctionFactory{

    EstateFactory public estateFactory;
    GPAToken public gpaToken;

    constructor(EstateFactory _estateFactory, GPAToken _token) public {
        estateFactory = EstateFactory(_estateFactory);
        gpaToken = GPAToken(_token);
    }

    
    EstateAuction[] private estateAuctions;     //EstateAuction 컨트랙트의 주소값을 담는 배열
    mapping(uint => address) estateAuctionOwner;    //EstateAuction컨트랙트 소유자 주소 맵핑
    mapping(address => bool) checkEstateAuctionOwner;   //EstateAution컨트랙트 생성 여부를 확인하기 위한 맵핑

    //EstateAuction 컨트랙트 생성
    function createAuction() public {
        EstateAuction newEstateAuction = new EstateAuction(msg.sender);
        uint id = estateAuctions.push(newEstateAuction);
        estateAuctionOwner[id] = msg.sender;
    }

    //생성된 EstateAuction 컨트랙트의 주소값을 배열 형태로 반환
    function getEstateAuctions() public view returns (EstateAuction[] memory){
        return estateAuctions;
    }

    //이전에 사용자가 EstateAuction 컨트랙트를 만들었는지 검사
    function getCheckEstateAuctionOwner() public view returns(bool) {
        return checkEstateAuctionOwner[msg.sender];
    }
}

contract EstateAuction is Ownable{
    
    //Auction 구조체
    struct Auction {
        string description;
        uint estateId;
        uint firstPrice;
        uint currentPrice;
        uint closingDate;
        bool complete;
        mapping(address => uint) auctioneer;
    }

    //Auction 구조체를 담는 배열
    Auction[] auctions;
    
    //EstateAuction 컨트랙트 Owner 주소
    address public manager;

    //EstateAuction 생성자
    constructor(address _manager) public {
        manager = _manager;
    }

    /*
    function getSummary() public view returns (uint, uint, uint) {
        return (
            auction.estateId,
            auction.currentPrice,
            auction.closingDate
        );
    }*/

    //Auction 생성
    function createAuction(string memory _description, uint _estateId, uint _firstPrice, uint _closingDate) public {
        Auction memory newAuction = Auction({
            description : _description,
            estateId : _estateId,
            firstPrice : _firstPrice,
            currentPrice : 0,
            closingDate : _closingDate,
            complete : false
        });

        auctions.push(newAuction);
    }
}