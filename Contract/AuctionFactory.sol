pragma solidity ^0.5.0;

import "./EstateFactory.sol";
import "./GPAToken.sol";
//import "./Ownable.sol";
import "./SafeMath.sol";

contract AuctionFactory {

    EstateFactory public estateFactory;
    GPAToken public gpaToken;

    //manager : AuctionFactorry Owner
    address public manager;

    constructor(EstateFactory _estateFactory, GPAToken _gpaToken) public {
        manager = msg.sender; //AuctionFactory 컨트랙트 주최자 account
        estateFactory = EstateFactory(_estateFactory);
        gpaToken = GPAToken(_gpaToken);
    }
    
    EstateAuction[] private estateAuctions;     //EstateAuction 컨트랙트의 주소값을 담는 배열
    mapping(uint => address) estateAuctionOwner;    //EstateAuction컨트랙트 소유자 주소 맵핑
    
    //mapping(address => bool) checkEstateAuctionOwner;   //EstateAution컨트랙트 생성 여부를 확인하기 위한 맵핑

    //EstateAuction 컨트랙트 생성
    function createAuction() public {
        EstateAuction newEstateAuction = new EstateAuction(manager, msg.sender, estateFactory, gpaToken); //msg.sender: Auction 사용자의 주소로 변경
        uint id = estateAuctions.push(newEstateAuction);
        estateAuctionOwner[id] = msg.sender; //msg.sender: Auction 사용자의 주소로 변경
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



contract EstateAuction is Ownable {

    using SafeMath for uint256;

    EstateFactory public estateFactory;
    GPAToken public gpaToken;
    
    //Auction 구조체
    struct Auction {
        string description; //설명
        uint estateId;  //토큰id?
        uint firstPrice; //최초 시작가
        uint currentPrice;  //현재 낙찰가   
        uint startTime; //옥션 시작시간
        uint endTime;   //옥션 마감시간
    }

    bool finishAuction = false; //옥션 마감 확인
    bool complete = false;  //옥션 거래 완료

    mapping(address => uint) participationPrice;   //옥션참가자의 참가 토큰개수
    mapping(uint => address) auctioneer;    //낙찰 순서대로 맵핑
    uint auctioneerCount;

    //Auction 구조체를 담는 변수
    Auction auction;
    
    address public manager;     //AuctionFactory 컨트랙트 Owner 
    address public host;    //EstateAuction 컨트랙트 Owner 

    //EstateAuction 생성자
    constructor(address _manager, address _host, EstateFactory _estateFactory, GPAToken _gpaToken) public {
        manager = _manager; 
        host = _host;
        estateFactory = _estateFactory; //ERC721 토큰 사용
        gpaToken = _gpaToken;   //ERC20 토큰 사용
    }

    //fallback 함수?
    function() external payable{

    }

    //Auction 생성
    function createAuction(string memory _description, uint _estateId, uint _firstPrice, uint _endTime) public {
        auction = Auction({
            description : _description,
            estateId : _estateId,
            firstPrice : _firstPrice,
            currentPrice : 0,
            startTime : now,
            endTime : _endTime
        });
    }


    //Auction 참가하기
    //_price는 참가 토큰 개수
    //참가자 address?
    function joinAuction(uint _price)  public payable inParticipationTime() returns(bool)  {
        Auction storage _auction = auction;
        //deposit 개념 미 적용
        //옥션참가자가 
        if( _price > _auction.currentPrice){
            participationPrice[msg.sender] = _price;
            auctioneer[auctioneerCount] = msg.sender;
            auctioneerCount.add(1);
            _auction.currentPrice = _price;
            return true;
        } else {
            return false;
        }
    }


    /*
    //경매가 종료되고 입찰가 상위 3명 이외의 사람의 토큰 돌려주기?? -> 필요없음
    function returnToken() public {
        //경매가 종료 되었는지 확인
        require(finishAuction, "Auction is not finished.");
        //상위 3명을 제외한 사람들의 토큰 순차적으로 돌려주기
        for (uint i = 0 ; i < auctioneer.length ; i++ ){
            //transfer(to, value);// ??? HOW???
        }
    }
    */

    address finalAuctioneer;

    //현재는 최종 낙찰자만...
    function setFinalAuctioneer() public returns(bool) {
        finalAuctioneer = auctioneer[auctioneerCount-1];
    }

    // multi-sig ?
    function consensus() public {
        


    }


    //서로 승인하고 거래하기
    //_price 거래되는 gpaToken 개수
    //_tokenId 거래되는 estateId

    
    /*
    function buyCard(uint _tokenId, uint _price) public returns (bool) {
        require(itemFactory.getItemSellingAvailable(_tokenId)
            && !(getOwnerOfToken(_tokenId) == msg.sender
            && itemFactory.balanceOf(msg.sender) >= _price
            ),"buyCard conditions not matched...");

        gameToken.transferFrom(msg.sender, getOwnerOfToken(_tokenId), _price);

        itemFactory.transferFrom(getOwnerOfToken(_tokenId), msg.sender, _tokenId);
        emit BuyCard(msg.sender, getOwnerOfToken(_tokenId), _tokenId, _price, uint32(now));
        return true;
    }
    */

    event completeAuctionn(address auctioneer, uint tokenId);

    function tradingEstate(address _host, address _auctioneer, uint _tokenId, uint _price) public returns(bool) {
        require( !(estateFactory.ownerOf(_tokenId) == _auctioneer)
            &&  (gpaToken.balanceOf(_auctioneer) >= _price)
            , "asdasdf...");

        gpaToken.transferFrom(_auctioneer, _host, _price); 
        
        estateFactory.transferFrom(_host, _auctioneer, _tokenId);
        
        //emit completeAuction(_auctioneer, _tokenId);
        return true;
    }

    //Auction 참가 종료시키기
    function closingAution() public returns(bool) {
        finishAuction = true;
    }

    //거래 완료
    function completeAuction() public onlyOwner returns(bool) {
        return complete = true;        
    }

    //참여가능한 옥션인가?
    modifier inParticipationTime() {
        require(
            canParticipate(),
            "This Auction is finished."
        );
        _;
    }

    //옥션이 진행중에 있는지 확인하는 함수
    function canParticipate() public view returns (bool) {
        Auction memory _auction = auction;
        if( now >= _auction.startTime && now <= _auction.endTime ) {
            return true;
        } else {
            //finishAuction = true;
            return false;
        }
    }

}
