/*
 * Checks validity of input as and when user fills in a field
 * Clears field if input is invalid
 */
function validateInput(id, value) { 
	
	var NaOCl = document.getElementById("NaOCl").value;
    var ppm = (NaOCl/1.05)*10000;
    var ClCon = document.getElementById("ClCon").value;

	/*
	 * Is input above 0?
	 * Is input a numerical value?
	 */
	if (value <= 0 && value != "") {
		alert("Please enter values greater than 0.");
		   document.getElementById(id).value = '';
	} else if (isNaN(value)) {
		alert("Please enter number values.");
		 document.getElementById(id).value = '';
	}
	
	/*
	 * Is the bleach product below the 30 NaCOl wt% limit?
	 */
    if ((id == 'NaOCl') && (value > 30)) {	
        alert("Maximum concentration of bleach product = 30 sodium hypochlorite (wt %)");
        document.getElementById('NaOCl').value = '';
    }  
    
    /*
     * Is ClCon <= NaCOl/1.05 * 10000?
     */
    if (((id == 'ClCon') || (id == 'NaOCl')) && (ClCon > ppm) && (NaOCl > 0)) {
    	alert("The desired concentration of chlorine solution is higher than the concentration in your bleach product."
        		+ " Calculation results cannot be displayed.");
        document.getElementById(id).value = '';
    } 
    
    /*
     * Is volume of chlorine solution below the 10000 limit?
     */
    if ((id =='ClSolVol') && (value > 10000)) {
        alert("Maximum volume of chlorine solution = 10,000");
        document.getElementById(id).value = '';
    }  

}


/*
 * Conversion from selected unit to milliliters.
 */
function convertTomL(unit){
	var converttomL = {
			L : 1000,
			gallons_US : 3785.41178,
			gallons_Imperial : 4546.092,
			mL : 1,
			pints_US : 473.176473,
			fluid_ounces_US : 29.5735295,
			pints_Imperial :	568.2615,
			fluid_ounces_Imperial : 28.413075,
			teaspoon : 4.92892159,
			tablespoon : 14.7867648,
			metric_cups : 236.588236,
			drops : 0.05		
	}
	return converttomL[unit];
}

/*
 * Performs calculation on given input to determine how much liquid bleach product to dilute with water
 * NaOCl = Concentration of Bleach Product (sodium hypochlorite wt %)
 * ClCon = Desired concentration of chlorine solution
 * ClSolVol = Desired volume of chlorine solution 
 */
function calc(){
	
	var NaOCl, ClCon, ClSolVol, bleachUnit, bleachUnitVal, bleachUnitName, ClSolVolUnit, ClSolVolUnitVal, ClSolVolUnitName;
	
	NaOCl = document.getElementById("NaOCl").value;
	ClCon = document.getElementById("ClCon").value;	
	ClSolVol = document.getElementById("ClSolVol").value;
	
	bleachUnit = document.getElementById("bleachUnit");
	bleachUnitVal = bleachUnit.options [bleachUnit.selectedIndex].value;
	bleachUnitName = bleachUnit.options[bleachUnit.selectedIndex].innerHTML
	
	ClSolVolUnit = document.getElementById("ClSolVolUnit");
	ClSolVolUnitVal = ClSolVolUnit.options[ClSolVolUnit.selectedIndex].value;
	ClSolVolUnitName = ClSolVolUnit.options[ClSolVolUnit.selectedIndex].innerHTML
	
	if ((!NaOCl || !ClCon || !ClSolVol)) {
		alert("Please fill in all the fields.");
		return false;
	} 
	
	/*
	 * BLEACH CALCULATION STEPS *
	 * 1. Convert desired concentration of Chlorine from ppm or mg/L to mg/mL
	 * 2. Convert concentration of Chlorine Volume in mL to desired volume in mL
	 * 	  Desired volume in mL = Desired volume amount * Desired unit in mL
	 * 3. Calculate available Chlorine in mg/mL
	 * 4. Calculate Amount of bleach to add
	 * 5. Calculate final result 
	 * 6. Calculate amount of water
	 */ 
	
	var ClConinmgmL, ClSolVolinmL, wtAvailCl, bleach, finalResult, waterAmount;
	
	ClConinmgmL = ClCon/1000;
	ClSolVolinmL = ClSolVol*(convertTomL(ClSolVolUnitVal));
	wtAvailCl = (NaOCl/1.05)*10;
	bleach = (ClConinmgmL*ClSolVolinmL)/wtAvailCl;
	finalResult = bleach/convertTomL(bleachUnitVal);
	waterAmount = (ClSolVolinmL - bleach)/(convertTomL(ClSolVolUnitVal));
	
	/* TODO: Check if final result needs to be rounded?
	 */
	var roundedResult = roundResult(finalResult, bleachUnitVal);
	var roundedWater = roundResult(waterAmount, 'water');
	
	displayResult(bleachUnitVal, roundedResult, roundedWater, bleachUnitName, ClSolVolUnitName);

}

/*
 * Displays calculated result or lets user know if result was too high or low 
 * Uses result of roundResult() function
 */
function displayResult(bleachUnitVal, roundedResult, roundedWater, bleachUnitName, ClSolVolUnitName){
	
	//Result is too low
	if (roundedResult == 'low') {
		if (bleachUnitVal == 'drops') {
			document.getElementById('calculatedResult').innerHTML = 'The result will be too low to be used to accurately prepare the final chlorine solution.'
				+ ' Enter a higher value for ‘Desired volume of chlorine solution’.';
		} else {
			document.getElementById('calculatedResult').innerHTML = 'The result will be too low.'
				+ ' Select a smaller unit for ‘Desired unit of measure for bleach product’.';
		}
	//Result is too high
	} else if (roundedResult == 'high') {
			document.getElementById('calculatedResult').innerHTML = 'The result will be too high. '
				+ ' Select a larger unit for ‘Desired unit of measure for bleach product’.';
	//All good
	} else {
		
		//Convert decimal to fraction
		if ((roundedResult % 1 != 0) && (bleachUnitVal == 'teaspoon' || 
										 bleachUnitVal == 'tablespoon' || 
										 bleachUnitVal == 'metric_cups' || 
										 bleachUnitVal == 'pints_US' || 
										 bleachUnitVal == 'pints_Imperial')) {
			var frac = new Fraction(roundedResult);
			var roundedResult = frac.toString();		
		} 
		
		document.getElementById('calculatedResult').innerHTML = "Add " + roundedResult + " " + bleachUnitName + 
		" of bleach product to "  + roundedWater + " " + ClSolVolUnitName + " of water.";
		
	}
	
}

/*
 * Rounds result value to nearest value according to the unit
 * Returns 'low' or 'high' if result was outside specified limits
 */
function roundResult(result, bleachUnit){
	
	if (bleachUnit == 'L' || bleachUnit == 'gallons_US' || bleachUnit == 'gallons_Imperial') {

		if (result < 1) {
			return 'low';
		} else {
			var rounder = Math.pow(10, 1);
			return (Math.round(result * rounder) / rounder).toFixed(1);
		}
		
	} else if ( bleachUnit == 'mL' ){
		
		//Check if value is below 1/8 
		if (result < 0.1) {
			return 'low';
		} else if (result > 2000) {
			return 'high';
		} else {
			var rounder = Math.pow(10, 1);
			return (Math.round(result * rounder) / rounder).toFixed(1);
		}
	
	
	} else if (bleachUnit == 'pints_US' || bleachUnit == 'pints_Imperial') {
		
		//Check if value is below 1/2 
		if (result < 0.5) {
			return 'low';
		} else if (result > 10) {
			return 'high';
		} else {
			return Math.round(result*2)/2;
		}
	} else if (bleachUnit == 'teaspoon') {
		
		//Check if value is below 1/8 
		if (result < 0.125) {
			return 'low';
		} else if (result > 3) {
			return 'high';
		} else {
			return Math.round(result*8)/8;
		}
	
	} else if (bleachUnit == 'tablespoon') {
		
		//Check if value is below 1/2 
		if (result < 0.5) {
			return 'low';
		} else if (result > 8) {
			return 'high';
		} else {
			return Math.round(result*2)/2;
		}
		
	} else if (bleachUnit == 'metric_cups'){
		
		if (result < 0.25) {
			return 'low';
		} else if (result > 20) {
			return 'high';
		} else {
			return Math.round(result*4)/4;
		}
	
	} else if (bleachUnit == 'drops') {
 
		if (result < 0.5) {
			return 'low';
		} else if (result > 25) {
			return 'high';
		} else {
			return Math.round(result);
		}
		
	} else if ( bleachUnit == 'fluid_ounces_US' || bleachUnit == 'fluid_ounces_Imperial' )  {

		if (result < 1) {
			return 'low';
		} else if (result > 128) {
			return 'high';
		} else {
			return Math.round(result);
		}
		
	} else if (bleachUnit == 'water') {
		
		var rounder = Math.pow(10, 1);
		return (Math.round(result * rounder) / rounder).toFixed(1);
		
	} else {
		return 'Result could not be calculated.'; 
	}
	
}
	

function toggleDisplay(id){
	 
    var x = document.getElementById(id);
    if (x.style.display == "none") {
        x.style.display = "block";
    } else if (x.id != "calculatedResult") {
        x.style.display = "none";
    }
}


function clearAllFields(){
	
	var root = document.getElementById("dilutionCalc")
	var inputs = root.getElementsByTagName("input");
		
	for (e = 0; e < inputs.length; e++){
		inputs[e].value = "";
	}
	
	document.getElementById("calculatedResult").innerHTML = "";
}