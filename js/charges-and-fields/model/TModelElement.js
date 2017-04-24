// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var chargesAndFields = require ('CHARGES_AND_FIELDS/chargesAndFields');
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  var TModelElement = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ModelElement );
    TObject.call( this, instance, phetioID );
  };

  phetioInherit( TObject, 'TModelElement', TModelElement, {}, {} );

  chargesAndFields.register( 'TModelElement', TModelElement );

  return TModelElement;
} );
