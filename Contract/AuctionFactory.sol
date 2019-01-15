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
    function createAuction(address _owner) public {
        EstateAuction newEstateAuction = new EstateAuction(manager, _owner, estateFactory, gpaToken); //msg.sender: Auction 사용자의 주소로 변경
        uint id = estateAuctions.push(newEstateAuction)-1;
        estateAuctionOwner[id] = _owner; 
        ownerEstateAuctionCount[_owner]++;
        emit NewAuction();
    }

    // _owner가 생성한 옥션의 개수 반환
    function getOwnerEstateAuctionCount(address _owner) public view returns(uint){
        return ownerEstateAuctionCount[_owner];
    }

    // _owner 가 생성한 옥션의 Idx 반환
    function getAuctionByOwner(address _owner) public view returns(uint[] memory){
        uint[] memory result = new uint[](ownerEstateAuctionCount[_owner]);
        uint cnt = 0;
        for(uint i=0; i<estateAuctions.length; i++){
            if(estateAuctionOwner[i] == _owner ){
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
    address public owner;    //EstateAuction 컨트랙트 Owner 
    address finalAuctioneer;    //최종 낙찰자

    bool checkAuctioneer;
    bool checkOwner;
    bool checkManager;

    //EstateAuction 생성자
    constructor(address _manager, address _owner, EstateFactory _estateFactory, GPAToken _gpaToken) public {
        manager = _manager; 
        owner = _owner;
        estateFactory = _estateFactory; //ERC721 토큰 사용
        gpaToken = _gpaToken;   //ERC20 토큰 사용
    }

    //Auction 생성
    function createAuction(string memory _description, uint _estateId, uint _firstPrice, uint _endTime) public {
        //_esteteId가 owner의 것인가 검사!!
        require(estateFactory.ownerOf(_estateId) == owner,"not owner's estateId");
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
        public payable 
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


    /*
    mapping(uint => address) finalAuctioneerList;
    

    uint finalAuctioneerCount;

    //현재는 최종 낙찰자만...
    function setFinalAuctioneerList() public returns(bool) {
        require(auctioneerCount > 0, "not auctioneer");
        
        finalAuctioneerList[0] = auctioneer[auctioneerCount-1];
        finalAuctioneer = finalAuctioneerList[0];
        uint cnt=1;
        for(uint i=2; i<auctioneerCount; i++){
            if(auctioneer[auctioneerCount-i] != finalAuctioneerList[cnt]){
                finalAuctioneerList[cnt]=auctioneer[auctioneerCount-i];
                cnt++;
            }

            if(cnt==3){
                finalAuctioneerCount =cnt;
                return true;
            }
        }
        finalAuctioneerCount = cnt;
        return true;
    }

    function getFinalAuctioneer(uint idx) public view returns(address){
        return finalAuctioneerList[idx];
    }

    //수정 필요.
    function setFinalAuctioneer() public returns(uint){
        Auction storage _auction = auction;
        if(_auction.endTime + 2 weeks < now && finalAuctioneerCount>2 ){
            finalAuctioneer = finalAuctioneerList[2];
            return 2;
        }           
        else if(_auction.endTime + 1 weeks < now && finalAuctioneerCount>1){
            finalAuctioneer = finalAuctioneerList[1];
            return 1;
        }else {
            return 0;
        } 
    }
    */

    function getFinishAuction() public view returns(bool){
        return finishAuction;
    }

    function getCompleteAuction() public view returns(bool) {
        return completeAuction;
    }

    function setCheckAuctioneer(address _auctioneer) public returns(bool) {
        require(finishAuction==true,"Auction is not finished.");
        require(_auctioneer == auctioneer[auctioneerCount-1], "not final auctioneer.");
        
        checkAuctioneer = true;
        return true;
    }

    function getCheckAuctioneer() public view returns(bool, address){
        return (checkAuctioneer, finalAuctioneer);
    }

    function setCheckOwner(address _owner) public returns(bool) {
        require(finishAuction==true,"Auction is not finished.");
        require(_owner == owner, "not owner.");

        checkOwner = true;
        return true;
    }

    function getCheckOwner() public view returns(bool) {
        return checkOwner;
    }

    function getEstateAuctionSummury() public view returns(string memory, uint, uint, uint, uint){
        Auction storage _auction = auction[0];
        return (_auction.description, _auction.firstPrice, _auction.currentPrice, _auction.startTime, _auction.endTime);
    }

    /*
    function getEstatAuctionDetail() public view returns(string memory, string memory, string memory, uint, bool){
        Auction storage _auction = auction[0];
        string memory estateOwnerName = estateFactory.estates[_auction.etstateId].estateOwner;
        string memory estateName = estateFactory.estates[_auction.etstateId].estateName;
        string memory estateAddr = estateFactory.estates[_auction.etstateId].estateAddr;
        uint estateSize = estateFactory.estates[_auction.etstateId].estateSize;
        bool estateAssurance = estateFactory.estates[_auction.etstateId].assurance;
        return (estateOwnerName, estateName, estateAddr, estateSize, estateAssurance);
    }
    */

    event completeAuctionEvent(address owner, address auctioneer, uint tokenId, uint price, uint32 time);

    function tradingEstate(address _auctioneer, uint _tokenId, uint _price) public returns(bool) {
        require(!(estateFactory.ownerOf(_tokenId) == _auctioneer), "estateId error.");  
        require(gpaToken.balanceOf(_auctioneer) >= _price, "you don't have enough token."); // 금액이 부족하지 않은가?
        require(_auctioneer == finalAuctioneer, "wrong auctioneer");    //최종 낙찰자 인가?
        require(checkAuctioneer, "checkAuctionner is false.");
        require(checkOwner, "checkOwner is false.");

        gpaToken.transferFrom(_auctioneer, owner, _price); 
        estateFactory.transferFrom(owner, _auctioneer, _tokenId);
        
        emit completeAuctionEvent(owner, _auctioneer, _tokenId, _price, uint32(now));
        return true;
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
    

    //거래 완료
    function setCompleteAuction() public returns(bool) {
        return completeAuction = true;        
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
