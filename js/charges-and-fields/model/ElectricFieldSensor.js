// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the electric field sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class ElectricFieldSensor extends ModelElement {

    /**
     * @param {Function} computeElectricField - function( Vector2 ) : number, computes electric field at the given
     *                                          point in the model.
     * @param {number|null} initialPosition - optionally pass a the initalPosition for the animating home from toolbox.
     *                                        This is to support PhET-iO State.
     * @param {Tandem} tandem
     */
    constructor( computeElectricField, initialPosition, tandem ) {

      super( {
        initialPosition: initialPosition,
        tandem: tandem,
        phetioDynamicElement: true
      } );

      // @public - electricField Vector in Newtons per Coulomb
      this.electricFieldProperty = new Vector2Property( new Vector2( 0, 0 ), {
        tandem: tandem.createTandem( 'electricFieldProperty' )
      } );

      this.computeElectricField = computeElectricField;

      // @public (phet-io)
      this.electricFieldSensorTandem = tandem;

      this.positionProperty.link( this.update.bind( this ) );
    }

    /**
     * Should be called to update the value of this sensor.
     * @public
     */
    update() {
      const eField = this.computeElectricField( this.positionProperty.get() );

      assert && assert( eField.x !== Infinity && eField.y !== Infinity, 'E-field is infinity: ' + eField );
      assert && assert( !_.isNaN( eField.x ) && !_.isNaN( eField.y ), 'E-field is NaN: ' + eField );

      this.electricFieldProperty.set( this.computeElectricField( this.positionProperty.get() ) );
    }

    /**
     * @public
     */
    dispose() {
      this.electricFieldProperty.dispose();
      super.dispose();
    }
  }

  return chargesAndFields.register( 'ElectricFieldSensor', ElectricFieldSensor );
} );