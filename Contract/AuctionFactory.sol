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
    mapping(address => uint) ownerEstateAuctionCount; // 사용자가 만든 경매의 수 저장
    
    //mapping(address => bool) checkEstateAuctionOwner;   //EstateAution컨트랙트 생성 여부를 확인하기 위한 맵핑

    event NewAuction();

    //EstateAuction 컨트랙트 생성
    function createAuction(address _auctionOwner) public {
        EstateAuction newEstateAuction = new EstateAuction(manager, _auctionOwner, estateFactory, gpaToken); //msg.sender: Auction 사용자의 주소로 변경
        uint id = estateAuctions.push(newEstateAuction)-1;
        estateAuctionOwner[id] = _auctionOwner; 
        ownerEstateAuctionCount[_auctionOwner]++;
        emit NewAuction();
    }

    // _owner가 생성한 옥션의 개수 반환
    function getOwnerEstateAuctionCount(address _auctionOwner) public view returns(uint){
        return ownerEstateAuctionCount[_auctionOwner];
    }

    // _owner 가 생성한 옥션의 Idx 반환
    function getAuctionByOwner(address _auctionOwner) public view returns(uint[] memory){
        uint[] memory result = new uint[](ownerEstateAuctionCount[_auctionOwner]);
        uint cnt = 0;
        for(uint i=0; i<estateAuctions.length; i++){
            if(estateAuctionOwner[i] == _auctionOwner ){
                result[cnt] = i;
                cnt++;
            }
        }
        return result;
    }

    //생성된 EstateAuction 컨트랙트의 주소값을 배열 형태로 반환
    function getEstateAuctions() public view returns (EstateAuction[] memory){
        return estateAuctions;
    }

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

    bool finishAuction; //옥션 마감 확인
    bool completeAuction;  //옥션 거래 완료

    mapping(address => uint) participationPrice;   //옥션참가자의 참가 토큰개수
    mapping(uint => address) auctioneer;    //낙찰 순서대로 맵핑
    uint auctioneerCount;

    //Auction 구조체를 담는 변수
    Auction[] public auction;
    
    address public manager;     //AuctionFactory 컨트랙트 Owner 
    address public auctionOwner;    //EstateAuction 컨트랙트 Owner 
    address finalAuctioneer;    //최종 낙찰자

    bool checkAuctioneer;
    bool checkAuctionOwner;
    bool checkManager;

    //EstateAuction 생성자
    constructor(address _manager, address _auctionOwner, EstateFactory _estateFactory, GPAToken _gpaToken) public {
        manager = _manager; 
        auctionOwner = _auctionOwner;
        estateFactory = _estateFactory; //ERC721 토큰 사용
        gpaToken = _gpaToken;   //ERC20 토큰 사용
    }

    //Auction 생성
    function createAuction(string memory _description, uint _estateId, uint _firstPrice, uint _endTime) public {
        //_esteteId가 owner의 것인가 검사!!
        require(estateFactory.ownerOf(_estateId) == auctionOwner,"not owner's estateId");
        auction.push(Auction({
            description : _description,
            estateId : _estateId,
            firstPrice : _firstPrice,
            currentPrice : _firstPrice-1,
            startTime : now,
            endTime : now + _endTime
        }));
    }


    //Auction 참가하기
    //_price는 참가 토큰 개수
    //참가자 address?
    function joinAuction(address _auctioneer, uint _price)
        public
        inParticipationTime()
        haveEnoughToken(_auctioneer, _price)  
        returns(bool)  
        {
        require(_auctioneer != finalAuctioneer, "already final Auctioneer.");
        Auction storage _auction = auction[0];
        //deposit 개념 미 적용
        //옥션참가자가 
        if( _price > _auction.currentPrice){
            //gpaToken.transferFrom(_auctioneer, _estateAuction, 10); //해당 컨트랙트에 10gpaToken 보증금 개념으로 보냄.
            participationPrice[_auctioneer] = _price;
            auctioneer[auctioneerCount] = _auctioneer;
            auctioneerCount++;
            finalAuctioneer = _auctioneer;
            _auction.currentPrice = _price;
            return true;
        } else {
            return false;
        }
    }


    function getFinishAuction() public view returns(bool){
        return finishAuction;
    }

    function getCompleteAuction() public view returns(bool) {
        return completeAuction;
    }

    function getFianlAuctioneer() public view returns(address) {
        return finalAuctioneer;
    }

    function setCheckManager(address _manager) public returns(bool) {
        require(finishAuction==true,"Auction is not finished.");
        require(manager == _manager, "not manager.");
        
        checkManager = true;
        return checkManager;
    }

    function getCheckManager() public view returns(bool){
        return checkManager;
    }

    function setCheckAuctioneer(address _auctioneer) public returns(bool) {
        require(finishAuction==true,"Auction is not finished.");
        require(_auctioneer == auctioneer[auctioneerCount-1], "not final auctioneer.");
        
        checkAuctioneer = true;
        return checkAuctioneer;
    }

    function getCheckAuctioneer() public view returns(bool, address){
        return (checkAuctioneer, finalAuctioneer);
    }

    //function approve(address _to, uint256 _tokenId) public;

    function setCheckOwner(address _auctionOwner) public returns(bool) {
        require(finishAuction==true,"Auction is not finished.");
        require(_auctionOwner == auctionOwner, "not owner.");

        checkAuctionOwner = true;
        return checkAuctionOwner;
    }

    function getCheckOwner() public view returns(bool) {
        return checkAuctionOwner;
    }

    function getEstateAuctionSummary() public view returns(string memory, uint, uint, uint, uint, uint){
        Auction storage _auction = auction[0];
        return (_auction.description, _auction.estateId, _auction.firstPrice, _auction.currentPrice, _auction.startTime, _auction.endTime);
    }


    event completeAuctionEvent(address auctionOwner, address auctioneer, uint tokenId, uint price, uint32 time);

    /*
    function tradingEstate(address _owner, address _auctioneer, uint _tokenId, uint _price) public returns(bool) {
       
        require(gpaToken.balanceOf(msg.sender) >= _price, "you don't have enough token."); // 금액이 부족하지 않은가?
        require(checkAuctioneer==true && checkOwner==true && checkManager==true, "check is false.");
  
        gpaToken.transferFrom(_auctioneer, _owner, _price); 
        estateFactory.transferFrom(_owner, _auctioneer, _tokenId); //estateTransferFrom으로 교체 예정
        
        completeAuction = true;
        emit completeAuctionEvent(owner, msg.sender, _tokenId, _price, uint32(now));
        return true;
    }
    */


    function tradingEstate( uint _tokenId, uint _price) public returns(bool) {
         
        //require(gpaToken.balanceOf(msg.sender) >= _price, "you don't have enough token."); // 금액이 부족하지 않은가?
        require(checkAuctioneer==true && checkAuctionOwner==true && checkManager==true, "check is false.");
  
        gpaToken.transferFrom(msg.sender, getOwnerOfToken(_tokenId), _price); 
        estateFactory.transferFrom(getOwnerOfToken(_tokenId), msg.sender, _tokenId); //estateTransferFrom으로 교체 예정
        
        completeAuction = true;
        emit completeAuctionEvent(auctionOwner, msg.sender, _tokenId, _price, uint32(now));
        return true;
    }

    function gpaTokenTransferFrom(uint _tokenId, uint _price) public returns(bool) {
        gpaToken.transferFrom(msg.sender, getOwnerOfToken(_tokenId), _price);

        return true;
    }

    function eestateFactoryTransferFrom(uint _tokenId) public returns(bool) {
        estateFactory.transferFrom(getOwnerOfToken(_tokenId), msg.sender, _tokenId);

        return true;
    }


    function getOwnerOfToken(uint _tokenId) public view returns (address) {
        return estateFactory.ownerOf(_tokenId);
    }

    //Auction 참가 종료시키기
    
    function closingAuction() public returns(bool) {
        if(!canParticipate()){
            finishAuction = true;
            return true; //정상적으로 Auction 종료
        }
        else
            return false; // Auction 종료x
        
    }
    
    // EstateId Approve 함수
    function approveEstateId(address _auctioneer, uint _estateId) public {
        require(auctionOwner == msg.sender);  //msg.sender는 estateId 주인
        require(finalAuctioneer == _auctioneer);

        estateFactory.approve(_auctioneer, _estateId);
    }

    function getApprovedEstateId(uint _estateId) public view returns(address) {
        return estateFactory.getApproved(_estateId);
    }

    //거래 완료
    /*
    function setCompleteAuction() public returns(bool) {
        return completeAuction = true;        
    }
    */

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
        Auction memory _auction = auction[0];
        if( now >= _auction.startTime && now <= _auction.endTime ) {
            return true;
        } else {
            //finishAuction = true;
            return false;
        }
    }

    modifier haveEnoughToken(address _auctioneer, uint _price) {
        require(gpaToken.balanceOf(_auctioneer) >= _price);
        _;
    } 

}
