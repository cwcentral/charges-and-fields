// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of a charged particle
 * The particle has charge (+1 or -1) and a mutable position.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );

  /**
   *
   * @param {Vector2} position - initial position of the charged particle
   * @param {Number} charge - (positive=+1 or negative=-1)
   * @constructor
   */
  function ChargedParticle( position, charge ) {

    ModelElement.call( this, position );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // @public read-only
    this.charge = charge;

  }

  return inherit( ModelElement, ChargedParticle, {
    // @public
    reset: function() {
      ModelElement.prototype.reset.call( this );
    }

  } );
} );


