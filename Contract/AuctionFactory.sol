pragma solidity ^0.5.0;

import "./EstateFactory.sol";
import "./GPAToken.sol";
import "./Ownable.sol";

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
        uint startTime;
        uint endTime;
        bool complete;
        mapping(address => uint) auctioneer; //옥션참가자의 참가금액
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
    function createAuction(string memory _description, uint _estateId, uint _firstPrice, uint _endTime) public {
        Auction memory newAuction = Auction({
            description : _description,
            estateId : _estateId,
            firstPrice : _firstPrice,
            currentPrice : 0,
            startTime : now,
            endTime : _endTime,
            complete : false
        });

        auctions.push(newAuction);
    }

    //참여가능한 옥션인가?
    modifier inParticipationTime(uint _auctionId) {
        require(
            canParticipate(_auctionId),
            "This Auction is finished."
        );
        _;
    }

    //옥션 참가 금액이 현재 낙찰가보다 높은가?
    modifier checkPrice(uint _auctionId, uint _auctionPrice) {
        
        require(
            cnaPrice(_auctionId, _auctionPrice),
            "This price is low than current price"  
        );
        _;
    }

    //참여가능한 옥션인지 확인하는 함수
    function canParticipate(uint _auctionId) public view returns (bool) {
        Auction memory _auction = auctions[_auctionId];
        return now >= _auction.startTime && now <= _auction.endTime;
    }

    function canPrice(uint _auctionId, uint _auctionPrice) public view returns (bool){
        Auction memory _auction = auctions[_auctionId];
        return  _auctionPrice > _auction.currentPrice ;
    }


    //Auction 참가하기
    function joinAuction(
        uint _auctionId, 
        uint _auctionPrice
        ) 
        public 
        inParticipationTime(_auctionId) 
        checkPrice(_auctionId, _auctionPrice)
        returns(bool)
    {
        Auction storage _auction = auctions[_auctionId];
        _auction.auctioneer[msg.sender] = _auctionPrice;
        return true;
    }

    // multi-sig ?
    function consensus() public {

    }

    //Auction 참가 종료시키기
    function closingAution() public {

    }

    //거래 완료
    function completeAuction() public {

    }

}