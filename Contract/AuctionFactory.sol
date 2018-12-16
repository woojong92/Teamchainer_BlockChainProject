pragma solidity ^0.5.0;

import "./EstateFactory.sol";
import "./GPAToken.sol";
import "./Ownable.sol";

contract AuctionFactory is Ownable{

    EstateFactory public estateFactory;
    GPAToken public gpaToken;

    address public manager;

    constructor(EstateFactory _estateFactory, GPAToken _token) public {
        manager = msg.sender;
        estateFactory = EstateFactory(_estateFactory);
        gpaToken = GPAToken(_token);
    }
    
    EstateAuction[] private estateAuctions;     //EstateAuction 컨트랙트의 주소값을 담는 배열
    mapping(uint => address) estateAuctionOwner;    //EstateAuction컨트랙트 소유자 주소 맵핑
    
    //mapping(address => bool) checkEstateAuctionOwner;   //EstateAution컨트랙트 생성 여부를 확인하기 위한 맵핑

    //EstateAuction 컨트랙트 생성
    function createAuction() public {
        EstateAuction newEstateAuction = new EstateAuction(manager, msg.sender, estateFactory, gpaToken);
        uint id = estateAuctions.push(newEstateAuction);
        estateAuctionOwner[id] = msg.sender;
    }

    //생성된 EstateAuction 컨트랙트의 주소값을 배열 형태로 반환
    function getEstateAuctions() public view returns (EstateAuction[] memory){
        return estateAuctions;
    }

    /*
    //이전에 사용자가 EstateAuction 컨트랙트를 만들었는지 검사
    function getCheckEstateAuctionOwner() public view returns(bool) {
        return checkEstateAuctionOwner[msg.sender];
    }
    */
}



contract EstateAuction{

    EstateFactory public estateFactory;
    GPAToken public gpaToken;
    
    //Auction 구조체
    struct Auction {
        string description;
        uint estateId;
        uint firstPrice;
        uint currentPrice;
        uint startTime;
        uint endTime;
        bool finishAuction;
        bool complete;
        mapping(address => uint) auctioneerPrice;   //옥션참가자의 참가 토큰개수
        mapping(uint => address) auctioneer;    //낙찰 순서대로 맵핑
    }

    //Auction 구조체를 담는 배열
    Auction[] auctions;
    
    
    address public manager;     //AuctionFactory 컨트랙트 Owner 
    address public host;    //EstateAuction 컨트랙트 Owner 

    //EstateAuction 생성자
    constructor(address _manager, address _host, EstateFactory _estateFactory, GPAToken _gpaToken) public {
        manager = _manager;
        host = _host;
        estateFactory = _estateFactory;
        gpaToken = _gpaToken;
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
            finishAuction : false,
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
            canPrice(_auctionId, _auctionPrice),
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

    //fallback 함수
    function() external payable{

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
        _auction.auctioneerPrice[msg.sender] = _auctionPrice;
        return true;
    }

    // multi-sig ?
    function consensus() public {

    }

    //Auction 참가 종료시키기
    function closingAution(uint _auctionId) public returns(bool) {
        Auction storage _auction = auctions[_auctionId];
        if( !canParticipate(_auctionId) ) {
            _auction.finishAuction = true;
            return true; //Auction 참가 기간 종료 
        } else {
            return false; //Auction 참가 기간 미종료
        }    
    }

    //거래 완료
    function completeAuction(uint _auctionId) public returns(bool) {
        Auction storage _auction = auctions[_auctionId];
        _auction.complete = true;
        return true;
    }

}
















